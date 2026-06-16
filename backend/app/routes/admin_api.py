from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.booking_service import (
    check_room_availability,
    create_booking,
    cancel_booking,
    get_booking_by_id,
    get_all_bookings,
    get_all_leads,
    get_all_call_logs,
    book_spa_session,
    reserve_restaurant,
)
from app.models.booking import (
    Booking, GuestLead, CallLog, SpaReservation, RestaurantReservation,
    ChatConversation, HousekeepingTask, ActivityBooking, Complaint, GuestLoyalty, EventInquiry, User
)
from app.models.room import Room
from app.dependencies import get_current_active_user

router = APIRouter(prefix="/api", tags=["admin"])


# --- Room Availability ---
@router.get("/rooms/availability")
def api_check_availability(
    room_type: Optional[str] = Query(None),
    check_in: Optional[str] = Query(None),
    check_out: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    ci = date.fromisoformat(check_in) if check_in else None
    co = date.fromisoformat(check_out) if check_out else None
    rooms = check_room_availability(db, room_type, ci, co)
    return {"rooms": rooms, "total_available": sum(r["available_rooms"] for r in rooms)}


# --- Bookings ---
@router.get("/bookings")
def api_get_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_all_bookings(db, skip, limit)


@router.get("/bookings/{booking_id}")
def api_get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "id": booking.id,
        "guest_name": booking.guest_name,
        "phone": booking.phone,
        "email": booking.email,
        "check_in": booking.check_in.isoformat(),
        "check_out": booking.check_out.isoformat(),
        "adults": booking.adults,
        "children": booking.children,
        "room_type": booking.room_type,
        "special_requests": booking.special_requests,
        "status": booking.status,
        "total_amount": booking.total_amount,
        "created_at": booking.created_at.isoformat() if booking.created_at else None,
    }


@router.post("/bookings")
def api_create_booking(
    guest_name: str,
    phone: str,
    email: str,
    check_in: str,
    check_out: str,
    adults: int = 1,
    children: int = 0,
    room_type: str = "Standard Room",
    special_requests: str = "",
    status: str = "pending",
    db: Session = Depends(get_db),
):
    ci = date.fromisoformat(check_in)
    co = date.fromisoformat(check_out)

    booking = create_booking(
        db=db,
        guest_name=guest_name,
        phone=phone,
        email=email,
        check_in=ci,
        check_out=co,
        adults=adults,
        children=children,
        room_type=room_type,
        special_requests=special_requests,
        status=status,
    )

    return {
        "success": True,
        "booking_id": booking.id,
        "total_amount": booking.total_amount,
        "message": f"Booking confirmed! ID: {booking.id}",
    }


@router.post("/bookings/{booking_id}/cancel")
def api_cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = cancel_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"success": True, "message": f"Booking {booking_id} has been cancelled."}


# --- Leads ---
@router.get("/leads")
def api_get_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_all_leads(db, skip, limit)


@router.post("/leads")
def api_create_lead(
    name: str,
    phone: str,
    email: str = "",
    check_in: Optional[str] = None,
    check_out: Optional[str] = None,
    adults: int = 1,
    children: int = 0,
    preference: str = "",
    notes: str = "",
    source: str = "website",
    db: Session = Depends(get_db),
):
    from app.services.booking_service import create_guest_lead

    ci = date.fromisoformat(check_in) if check_in else None
    co = date.fromisoformat(check_out) if check_out else None

    lead = create_guest_lead(
        db=db,
        name=name,
        phone=phone,
        email=email,
        check_in=ci,
        check_out=co,
        adults=adults,
        children=children,
        preference=preference,
        notes=notes,
        source=source,
    )

    return {"success": True, "lead_id": lead.id}


# --- Call Logs ---
@router.get("/call-logs")
def api_get_call_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_all_call_logs(db, skip, limit)


# --- Spa ---
@router.post("/spa/book")
def api_book_spa(
    guest_name: str,
    phone: str,
    email: str = "",
    service: str = "Massage",
    date_str: str = "",
    time: str = "10:00",
    notes: str = "",
    db: Session = Depends(get_db),
):
    dt = date.fromisoformat(date_str) if date_str else date.today()
    reservation = book_spa_session(db, guest_name, phone, email, service, dt, time, notes)
    return {"success": True, "spa_reservation_id": reservation.id}


# --- Restaurant ---
@router.post("/restaurant/reserve")
def api_reserve_restaurant(
    guest_name: str,
    phone: str,
    email: str = "",
    guests: int = 2,
    date_str: str = "",
    time: str = "19:00",
    special_requests: str = "",
    db: Session = Depends(get_db),
):
    dt = date.fromisoformat(date_str) if date_str else date.today()
    reservation = reserve_restaurant(db, guest_name, phone, email, guests, dt, time, special_requests)
    return {"success": True, "restaurant_reservation_id": reservation.id}


# --- Dashboard ---
@router.get("/dashboard")
def api_dashboard(db: Session = Depends(get_db)):
    total_bookings = db.query(Booking).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "confirmed").count()
    pending_bookings = db.query(Booking).filter(Booking.status == "pending").count()
    checked_in = db.query(Booking).filter(Booking.status == "checked_in").count()
    total_leads = db.query(GuestLead).count()
    total_calls = db.query(CallLog).count()
    total_spa = db.query(SpaReservation).count()
    total_restaurant = db.query(RestaurantReservation).count()
    total_chat_conversations = db.query(ChatConversation).count()
    active_chats = db.query(ChatConversation).filter(ChatConversation.status == "active").count()
    open_complaints = db.query(Complaint).filter(Complaint.status == "open").count()
    pending_housekeeping = db.query(HousekeepingTask).filter(HousekeepingTask.status == "pending").count()
    total_activities = db.query(ActivityBooking).count()
    total_events = db.query(EventInquiry).count()

    # Revenue from confirmed/checked_in/checked_out bookings
    from sqlalchemy import func
    revenue_result = db.query(func.sum(Booking.total_amount)).filter(
        Booking.status.in_(["confirmed", "checked_in", "checked_out"])
    ).scalar()
    total_revenue = float(revenue_result or 0)

    # Total rooms across all types for occupancy
    total_rooms = db.query(Room).count() or 10
    occupancy_rate = round((checked_in / total_rooms) * 100) if total_rooms else 0

    return {
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_bookings": pending_bookings,
        "checked_in": checked_in,
        "total_leads": total_leads,
        "total_calls": total_calls,
        "total_spa": total_spa,
        "total_restaurant": total_restaurant,
        "total_chat_conversations": total_chat_conversations,
        "active_chats": active_chats,
        "open_complaints": open_complaints,
        "pending_housekeeping": pending_housekeeping,
        "total_activities": total_activities,
        "total_events": total_events,
        "total_revenue": total_revenue,
        "occupancy_rate": occupancy_rate,
    }


# --- Housekeeping ---
@router.get("/housekeeping")
def api_get_housekeeping(db: Session = Depends(get_db)):
    tasks = db.query(HousekeepingTask).order_by(HousekeepingTask.created_at.desc()).all()
    return [
        {
            "id": t.id, "room_number": t.room_number, "task_type": t.task_type,
            "priority": t.priority, "status": t.status, "assigned_to": t.assigned_to,
            "guest_name": t.guest_name, "notes": t.notes,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None,
        }
        for t in tasks
    ]


@router.post("/housekeeping")
def api_create_housekeeping(
    room_number: str, task_type: str, priority: str = "normal",
    assigned_to: str = "", guest_name: str = "", notes: str = "",
    db: Session = Depends(get_db),
):
    task = HousekeepingTask(
        room_number=room_number, task_type=task_type, priority=priority,
        assigned_to=assigned_to, guest_name=guest_name, notes=notes
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"success": True, "task_id": task.id}


@router.post("/housekeeping/{task_id}/status")
def api_update_housekeeping_status(task_id: int, status: str, db: Session = Depends(get_db)):
    task = db.query(HousekeepingTask).filter(HousekeepingTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = status
    if status == "completed":
        task.completed_at = datetime.utcnow()
    db.commit()
    return {"success": True}


# --- Activities ---
@router.get("/activities")
def api_get_activities(db: Session = Depends(get_db)):
    items = db.query(ActivityBooking).order_by(ActivityBooking.created_at.desc()).all()
    return [
        {
            "id": a.id, "guest_name": a.guest_name, "phone": a.phone, "email": a.email,
            "activity": a.activity, "date": a.date.isoformat() if a.date else None,
            "time": a.time, "participants": a.participants, "amount": a.amount,
            "status": a.status, "notes": a.notes,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in items
    ]


@router.post("/activities")
def api_create_activity(
    guest_name: str, phone: str, activity: str, activity_date: str,
    email: str = "", time: str = "09:00", participants: int = 1,
    amount: float = 0.0, notes: str = "",
    db: Session = Depends(get_db),
):
    activity_prices = {
        "Trekking": 800, "ATV Ride": 1500, "Kayaking": 1200,
        "Cycling": 600, "Safari": 2500, "Bonfire": 500,
    }
    if amount == 0:
        amount = activity_prices.get(activity, 1000) * participants
    act_date = date.fromisoformat(activity_date)
    item = ActivityBooking(
        guest_name=guest_name, phone=phone, email=email, activity=activity,
        date=act_date, time=time, participants=participants, amount=amount, notes=notes
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"success": True, "activity_id": item.id}


# --- Complaints ---
@router.get("/complaints")
def api_get_complaints(db: Session = Depends(get_db)):
    items = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    return [
        {
            "id": c.id, "guest_name": c.guest_name, "phone": c.phone,
            "room_number": c.room_number, "category": c.category,
            "description": c.description, "priority": c.priority,
            "status": c.status, "assigned_to": c.assigned_to, "resolution": c.resolution,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "resolved_at": c.resolved_at.isoformat() if c.resolved_at else None,
        }
        for c in items
    ]


@router.post("/complaints")
def api_create_complaint(
    guest_name: str, description: str,
    phone: str = "", room_number: str = "", category: str = "general",
    priority: str = "normal", assigned_to: str = "",
    db: Session = Depends(get_db),
):
    item = Complaint(
        guest_name=guest_name, phone=phone, room_number=room_number,
        category=category, description=description, priority=priority,
        assigned_to=assigned_to
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"success": True, "complaint_id": item.id}


@router.post("/complaints/{complaint_id}/resolve")
def api_resolve_complaint(complaint_id: int, resolution: str = "", db: Session = Depends(get_db)):
    item = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Complaint not found")
    item.status = "resolved"
    item.resolution = resolution
    item.resolved_at = datetime.utcnow()
    db.commit()
    return {"success": True}


# --- Loyalty ---
@router.get("/loyalty")
def api_get_loyalty(db: Session = Depends(get_db)):
    items = db.query(GuestLoyalty).order_by(GuestLoyalty.points.desc()).all()
    return [
        {
            "id": g.id, "guest_name": g.guest_name, "phone": g.phone, "email": g.email,
            "points": g.points, "tier": g.tier, "total_stays": g.total_stays,
            "total_spent": g.total_spent,
            "last_stay": g.last_stay.isoformat() if g.last_stay else None,
        }
        for g in items
    ]


@router.post("/loyalty")
def api_create_loyalty(
    guest_name: str, phone: str, email: str = "",
    points: int = 0, db: Session = Depends(get_db),
):
    tier = "platinum" if points >= 5000 else "gold" if points >= 2000 else "silver"
    item = GuestLoyalty(guest_name=guest_name, phone=phone, email=email, points=points, tier=tier)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"success": True, "loyalty_id": item.id}


# --- Events ---
@router.get("/events")
def api_get_events(db: Session = Depends(get_db)):
    items = db.query(EventInquiry).order_by(EventInquiry.created_at.desc()).all()
    return [
        {
            "id": e.id, "guest_name": e.guest_name, "phone": e.phone, "email": e.email,
            "event_type": e.event_type,
            "event_date": e.event_date.isoformat() if e.event_date else None,
            "guests_count": e.guests_count, "budget": e.budget,
            "requirements": e.requirements, "status": e.status, "notes": e.notes,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in items
    ]


@router.post("/events")
def api_create_event(
    guest_name: str, phone: str, event_type: str = "wedding",
    email: str = "", event_date: Optional[str] = None,
    guests_count: int = 50, budget: str = "", requirements: str = "", notes: str = "",
    db: Session = Depends(get_db),
):
    ed = date.fromisoformat(event_date) if event_date else None
    item = EventInquiry(
        guest_name=guest_name, phone=phone, email=email, event_type=event_type,
        event_date=ed, guests_count=guests_count, budget=budget,
        requirements=requirements, notes=notes
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"success": True, "event_id": item.id}


@router.post("/events/{event_id}/status")
def api_update_event_status(event_id: int, status: str, db: Session = Depends(get_db)):
    item = db.query(EventInquiry).filter(EventInquiry.id == event_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    item.status = status
    db.commit()
    return {"success": True}


# --- Spa list ---
@router.get("/spa")
def api_get_spa(db: Session = Depends(get_db)):
    items = db.query(SpaReservation).order_by(SpaReservation.created_at.desc()).all()
    return [
        {
            "id": s.id, "guest_name": s.guest_name, "phone": s.phone, "email": s.email,
            "service": s.service, "date": s.date.isoformat() if s.date else None,
            "time": s.time, "notes": s.notes,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in items
    ]


# --- Restaurant list ---
@router.get("/restaurant")
def api_get_restaurant(db: Session = Depends(get_db)):
    items = db.query(RestaurantReservation).order_by(RestaurantReservation.created_at.desc()).all()
    return [
        {
            "id": r.id, "guest_name": r.guest_name, "phone": r.phone, "email": r.email,
            "guests": r.guests, "date": r.date.isoformat() if r.date else None,
            "time": r.time, "special_requests": r.special_requests,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in items
    ]


# --- Payment demo ---
@router.post("/bookings/{booking_id}/pay")
def api_mark_paid(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)
    from app.services.notifications import send_booking_confirmation_email, get_whatsapp_link
    email_sent = send_booking_confirmation_email(booking)
    wa_link = get_whatsapp_link(booking)
    return {"success": True, "message": "Payment received. Booking confirmed.", "email_sent": email_sent, "whatsapp_link": wa_link}


@router.post("/bookings/{booking_id}/confirm")
def api_confirm_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)
    from app.services.notifications import send_booking_confirmation_email, get_whatsapp_link
    email_sent = send_booking_confirmation_email(booking)
    wa_link = get_whatsapp_link(booking)
    return {"success": True, "booking_id": booking_id, "email_sent": email_sent, "whatsapp_link": wa_link}
