from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.booking import (
    Booking, ServiceRequest, RequestStatus, Payment, PaymentStatus, User, UserRole,
)
from app.models.room import Room

router = APIRouter(prefix="/api/my", tags=["Customer Portal"])

ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "checked_in"]


def _paid_amount(db: Session, booking_id: int) -> float:
    rows = db.query(Payment).filter(
        Payment.booking_id == booking_id,
        Payment.payment_status == PaymentStatus.PAID.value,
    ).all()
    return round(sum(p.amount or 0 for p in rows), 2)


def _require_customer(current_user: User):
    if current_user.role != UserRole.CUSTOMER.value:
        raise HTTPException(status_code=403, detail="This area is for customer accounts only")


def _my_bookings(db: Session, user: User):
    """A customer's bookings are matched to their account by email."""
    return db.query(Booking).filter(Booking.email == user.email).order_by(Booking.check_in.desc()).all()


def _nights(b: Booking) -> int:
    try:
        return max((b.check_out - b.check_in).days, 0)
    except Exception:
        return 0


def _serialize_booking(b: Booking, room: Room | None) -> dict:
    return {
        "id": b.id,
        "guest_name": b.guest_name,
        "room_type": b.room_type,
        "check_in": b.check_in.isoformat() if b.check_in else None,
        "check_out": b.check_out.isoformat() if b.check_out else None,
        "nights": _nights(b),
        "adults": b.adults,
        "children": b.children,
        "room_count": b.room_count,
        "special_requests": b.special_requests,
        "status": b.status,
        "total_amount": b.total_amount,
        "created_at": b.created_at.isoformat() if b.created_at else None,
        "room": {
            "name": room.name,
            "description": room.description,
            "price_per_night": room.price_per_night,
            "max_adults": room.max_adults,
            "max_children": room.max_children,
            "amenities": [a.strip() for a in (room.amenities or "").split(",") if a.strip()],
        } if room else None,
    }


@router.get("/bookings")
def my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_customer(current_user)
    bookings = _my_bookings(db, current_user)
    rooms = {r.room_type: r for r in db.query(Room).all()}
    return [_serialize_booking(b, rooms.get(b.room_type)) for b in bookings]


@router.get("/invoices")
def my_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Invoices derived from the customer's bookings, reflecting real payments.
    (Full GST invoices with line items arrive in Phase 5.)"""
    _require_customer(current_user)
    bookings = _my_bookings(db, current_user)
    invoices = []
    for b in bookings:
        total = b.total_amount or 0
        paid = _paid_amount(db, b.id)
        due = round(max(total - paid, 0), 2)
        if b.status == "cancelled":
            payment_status = "cancelled"
        elif total > 0 and paid >= total:
            payment_status = "paid"
        elif paid > 0:
            payment_status = "partial"
        else:
            payment_status = "due"
        invoices.append({
            "invoice_number": f"INV-{b.id:05d}",
            "booking_id": b.id,
            "room_type": b.room_type,
            "nights": _nights(b),
            "amount": total,
            "paid_amount": paid,
            "due_amount": due,
            "payment_status": payment_status,
            "issued_date": b.created_at.isoformat() if b.created_at else None,
            "check_in": b.check_in.isoformat() if b.check_in else None,
            "check_out": b.check_out.isoformat() if b.check_out else None,
        })
    return invoices


@router.get("/summary")
def my_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_customer(current_user)
    bookings = _my_bookings(db, current_user)
    today = date.today()

    active_bookings = [b for b in bookings if b.status in ACTIVE_BOOKING_STATUSES]
    upcoming = [b for b in bookings if b.check_in and b.check_in >= today and b.status != "cancelled"]
    amount_due = sum(
        max((b.total_amount or 0) - _paid_amount(db, b.id), 0)
        for b in bookings if b.status != "cancelled"
    )

    requests = db.query(ServiceRequest).filter(ServiceRequest.created_by_user_id == current_user.id).all()
    open_requests = [r for r in requests if r.status not in (RequestStatus.COMPLETED.value, RequestStatus.CLOSED.value)]

    return {
        "total_bookings": len(bookings),
        "active_bookings": len(active_bookings),
        "upcoming_bookings": len(upcoming),
        "total_requests": len(requests),
        "open_requests": len(open_requests),
        "amount_due": round(amount_due, 2),
    }
