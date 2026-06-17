from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.booking import (
    Booking, Payment, PaymentStatus, PaymentType, User, UserRole,
)
from app.services import payment_service

router = APIRouter(prefix="/api/payments", tags=["Payments"])

MANAGE_ROLES = [UserRole.ADMIN.value, UserRole.STAFF.value]


def _booking_paid_amount(db: Session, booking_id: int) -> float:
    rows = db.query(Payment).filter(
        Payment.booking_id == booking_id,
        Payment.payment_status == PaymentStatus.PAID.value,
    ).all()
    return round(sum(p.amount or 0 for p in rows), 2)


def _can_access_booking(db: Session, user: User, booking: Booking) -> bool:
    if user.role in MANAGE_ROLES:
        return True
    if user.role == UserRole.CUSTOMER.value and booking.email == user.email:
        return True
    return False


def _serialize_payment(p: Payment) -> dict:
    return {
        "id": p.id,
        "booking_id": p.booking_id,
        "amount": p.amount,
        "currency": p.currency,
        "payment_type": p.payment_type,
        "payment_status": p.payment_status,
        "order_id": p.order_id,
        "transaction_id": p.transaction_id,
        "method": p.method,
        "is_mock": p.is_mock,
        "notes": p.notes,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def _finalize_if_fully_paid(db: Session, booking: Booking):
    """Confirm a pending booking once its payments cover the total."""
    paid = _booking_paid_amount(db, booking.id)
    if booking.total_amount and paid >= booking.total_amount and booking.status == "pending":
        booking.status = "confirmed"
        db.commit()


@router.get("/config")
def payment_config(current_user: User = Depends(get_current_active_user)):
    return payment_service.public_config()


@router.get("/booking/{booking_id}/summary")
def booking_payment_summary(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if not _can_access_booking(db, current_user, booking):
        raise HTTPException(status_code=403, detail="You cannot view payments for this booking")

    paid = _booking_paid_amount(db, booking_id)
    total = booking.total_amount or 0
    payments = db.query(Payment).filter(Payment.booking_id == booking_id).order_by(Payment.created_at.desc()).all()
    return {
        "booking_id": booking_id,
        "total_amount": total,
        "paid_amount": paid,
        "due_amount": round(max(total - paid, 0), 2),
        "fully_paid": total > 0 and paid >= total,
        "payments": [_serialize_payment(p) for p in payments],
    }


@router.post("/create-order")
def create_order(
    booking_id: int,
    amount: Optional[float] = None,
    payment_type: str = PaymentType.FULL.value,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if not _can_access_booking(db, current_user, booking):
        raise HTTPException(status_code=403, detail="You cannot pay for this booking")
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot pay for a cancelled booking")

    due = round((booking.total_amount or 0) - _booking_paid_amount(db, booking_id), 2)
    if due <= 0:
        raise HTTPException(status_code=400, detail="This booking is already fully paid")

    pay_amount = round(amount if amount is not None else due, 2)
    if pay_amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")
    if pay_amount > due:
        raise HTTPException(status_code=400, detail=f"Amount exceeds the outstanding balance of {due}")

    resolved_type = PaymentType.PARTIAL.value if pay_amount < due else PaymentType.FULL.value
    order = payment_service.create_order(
        pay_amount, receipt=f"booking-{booking_id}", notes={"booking_id": str(booking_id)}
    )

    payment = Payment(
        booking_id=booking_id,
        amount=pay_amount,
        currency=order["currency"],
        payment_type=resolved_type,
        payment_status=PaymentStatus.PENDING.value,
        order_id=order["order_id"],
        is_mock=order["mock"],
        created_by_user_id=current_user.id,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    cfg = payment_service.public_config()
    return {
        "payment_id": payment.id,
        "order_id": order["order_id"],
        "amount": pay_amount,
        "amount_minor": order["amount"],
        "currency": order["currency"],
        "mode": cfg["mode"],
        "key_id": cfg["key_id"],
        "booking": {"id": booking.id, "guest_name": booking.guest_name},
    }


def _mark_paid(db: Session, payment: Payment, transaction_id: str, method: str):
    payment.payment_status = PaymentStatus.PAID.value
    payment.transaction_id = transaction_id
    payment.method = method or ("mock" if payment.is_mock else "razorpay")
    db.commit()
    db.refresh(payment)
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking:
        _finalize_if_fully_paid(db, booking)


@router.post("/verify")
def verify_payment(
    payment_id: int,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if not booking or not _can_access_booking(db, current_user, booking):
        raise HTTPException(status_code=403, detail="Not allowed")

    if not payment_service.verify_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        payment.payment_status = PaymentStatus.FAILED.value
        db.commit()
        raise HTTPException(status_code=400, detail="Payment signature verification failed")

    _mark_paid(db, payment, razorpay_payment_id, "razorpay")
    return {"success": True, "payment": _serialize_payment(payment)}


@router.post("/{payment_id}/simulate")
def simulate_payment(
    payment_id: int,
    outcome: str = "success",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Mock-only: complete or fail a pending payment without a real gateway."""
    if not payment_service.is_mock():
        raise HTTPException(status_code=400, detail="Simulation is only available in mock mode")
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if not booking or not _can_access_booking(db, current_user, booking):
        raise HTTPException(status_code=403, detail="Not allowed")
    if payment.payment_status != PaymentStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Payment is not pending")

    if outcome == "failure":
        payment.payment_status = PaymentStatus.FAILED.value
        db.commit()
        db.refresh(payment)
        return {"success": False, "payment": _serialize_payment(payment)}

    txn = payment_service.new_mock_payment_id()
    _mark_paid(db, payment, txn, "mock")
    return {"success": True, "payment": _serialize_payment(payment)}


@router.post("/{payment_id}/refund")
def refund_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Only admins can issue refunds")
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.payment_status != PaymentStatus.PAID.value:
        raise HTTPException(status_code=400, detail="Only paid payments can be refunded")

    payment_service.refund(payment.transaction_id, payment.amount)
    payment.payment_status = PaymentStatus.REFUNDED.value
    db.commit()
    db.refresh(payment)
    return {"success": True, "payment": _serialize_payment(payment)}


@router.get("")
def list_payments(
    booking_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Payment)
    if current_user.role == UserRole.CUSTOMER.value:
        my_booking_ids = [b.id for b in db.query(Booking).filter(Booking.email == current_user.email).all()]
        query = query.filter(Payment.booking_id.in_(my_booking_ids or [-1]))
    elif current_user.role not in MANAGE_ROLES:
        raise HTTPException(status_code=403, detail="Not allowed")

    if booking_id:
        query = query.filter(Payment.booking_id == booking_id)
    if status:
        query = query.filter(Payment.payment_status == status)
    return [_serialize_payment(p) for p in query.order_by(Payment.created_at.desc()).all()]
