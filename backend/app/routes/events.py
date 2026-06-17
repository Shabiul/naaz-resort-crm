from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.booking import EventInquiry, EventStatus, Venue, User, UserRole

router = APIRouter(prefix="/api", tags=["Events & Venues"])

# Statuses that still occupy a venue (i.e. block its availability for a date).
ACTIVE_EVENT_STATUSES = [
    EventStatus.QUOTATION_SENT.value,
    EventStatus.NEGOTIATION.value,
    EventStatus.CONFIRMED.value,
]

MANAGE_ROLES = [UserRole.ADMIN.value, UserRole.STAFF.value]


def _require_manager(current_user: User):
    if current_user.role not in MANAGE_ROLES:
        raise HTTPException(status_code=403, detail="Only admins and staff can manage this resource")


def _serialize_venue(v: Venue) -> dict:
    return {
        "id": v.id,
        "name": v.name,
        "venue_type": v.venue_type,
        "capacity_min": v.capacity_min,
        "capacity_max": v.capacity_max,
        "price_per_event": v.price_per_event,
        "description": v.description,
        "amenities": [a.strip() for a in (v.amenities or "").split(",") if a.strip()],
        "is_active": v.is_active,
        "created_at": v.created_at.isoformat() if v.created_at else None,
    }


def _serialize_event(e: EventInquiry, venue_map: dict | None = None) -> dict:
    venue = None
    if e.venue_id and venue_map is not None:
        venue = venue_map.get(e.venue_id)
    return {
        "id": e.id,
        "guest_name": e.guest_name,
        "phone": e.phone,
        "email": e.email,
        "event_type": e.event_type,
        "event_date": e.event_date.isoformat() if e.event_date else None,
        "guests_count": e.guests_count,
        "budget": e.budget,
        "quoted_amount": e.quoted_amount or 0.0,
        "requirements": e.requirements,
        "status": e.status,
        "venue_id": e.venue_id,
        "venue_name": venue.name if venue else None,
        "notes": e.notes,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }


# ---------------------------------------------------------------------------
# Venues
# ---------------------------------------------------------------------------
@router.get("/venues")
def list_venues(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Venue)
    if active_only:
        query = query.filter(Venue.is_active == True)  # noqa: E712
    venues = query.order_by(Venue.name.asc()).all()
    return [_serialize_venue(v) for v in venues]


@router.get("/venues/availability")
def venue_availability(
    event_date: str = Query(..., description="Date to check, YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        target = date.fromisoformat(event_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="event_date must be YYYY-MM-DD")

    booked = db.query(EventInquiry).filter(
        EventInquiry.event_date == target,
        EventInquiry.status.in_(ACTIVE_EVENT_STATUSES),
        EventInquiry.venue_id.isnot(None),
    ).all()
    booked_by_venue = {b.venue_id: b for b in booked}

    venues = db.query(Venue).filter(Venue.is_active == True).order_by(Venue.name.asc()).all()  # noqa: E712
    result = []
    for v in venues:
        booking = booked_by_venue.get(v.id)
        item = _serialize_venue(v)
        item["available"] = booking is None
        item["booked_by"] = booking.guest_name if booking else None
        result.append(item)
    return {"date": event_date, "venues": result}


@router.get("/venues/{venue_id}")
def get_venue(
    venue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return _serialize_venue(venue)


@router.post("/venues")
def create_venue(
    name: str,
    venue_type: str = "lawn",
    capacity_min: int = 0,
    capacity_max: int = 100,
    price_per_event: float = 0.0,
    description: str = "",
    amenities: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_manager(current_user)
    venue = Venue(
        name=name,
        venue_type=venue_type,
        capacity_min=capacity_min,
        capacity_max=capacity_max,
        price_per_event=price_per_event,
        description=description,
        amenities=amenities,
    )
    db.add(venue)
    db.commit()
    db.refresh(venue)
    return _serialize_venue(venue)


@router.patch("/venues/{venue_id}")
def update_venue(
    venue_id: int,
    name: Optional[str] = None,
    venue_type: Optional[str] = None,
    capacity_min: Optional[int] = None,
    capacity_max: Optional[int] = None,
    price_per_event: Optional[float] = None,
    description: Optional[str] = None,
    amenities: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_manager(current_user)
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")

    if name is not None:
        venue.name = name
    if venue_type is not None:
        venue.venue_type = venue_type
    if capacity_min is not None:
        venue.capacity_min = capacity_min
    if capacity_max is not None:
        venue.capacity_max = capacity_max
    if price_per_event is not None:
        venue.price_per_event = price_per_event
    if description is not None:
        venue.description = description
    if amenities is not None:
        venue.amenities = amenities
    if is_active is not None:
        venue.is_active = is_active

    db.commit()
    db.refresh(venue)
    return _serialize_venue(venue)


@router.delete("/venues/{venue_id}")
def delete_venue(
    venue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Only admins can delete venues")
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    # Clear references so events don't point at a deleted venue
    db.query(EventInquiry).filter(EventInquiry.venue_id == venue_id).update(
        {EventInquiry.venue_id: None}, synchronize_session=False
    )
    db.delete(venue)
    db.commit()
    return {"success": True, "message": "Venue deleted"}


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------
def _venue_map(db: Session) -> dict:
    return {v.id: v for v in db.query(Venue).all()}


@router.get("/events")
def list_events(
    status: Optional[str] = None,
    event_type: Optional[str] = None,
    venue_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(EventInquiry)
    if status:
        query = query.filter(EventInquiry.status == status)
    if event_type:
        query = query.filter(EventInquiry.event_type == event_type)
    if venue_id:
        query = query.filter(EventInquiry.venue_id == venue_id)
    items = query.order_by(EventInquiry.created_at.desc()).all()
    venue_map = _venue_map(db)
    return [_serialize_event(e, venue_map) for e in items]


@router.get("/events/stats")
def event_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    events = db.query(EventInquiry).all()
    by_status = {s.value: 0 for s in EventStatus}
    pipeline_value = 0.0
    confirmed_value = 0.0
    today = date.today()
    upcoming = 0
    for e in events:
        by_status[e.status] = by_status.get(e.status, 0) + 1
        amount = e.quoted_amount or 0.0
        if e.status in ACTIVE_EVENT_STATUSES:
            pipeline_value += amount
        if e.status == EventStatus.CONFIRMED.value:
            confirmed_value += amount
            if e.event_date and e.event_date >= today:
                upcoming += 1
    return {
        "total": len(events),
        "by_status": by_status,
        "upcoming_count": upcoming,
        "pipeline_value": round(pipeline_value, 2),
        "confirmed_value": round(confirmed_value, 2),
    }


@router.get("/events/upcoming")
def upcoming_events(
    days: int = 90,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    today = date.today()
    horizon = today + timedelta(days=days)
    items = db.query(EventInquiry).filter(
        EventInquiry.event_date.isnot(None),
        EventInquiry.event_date >= today,
        EventInquiry.event_date <= horizon,
        EventInquiry.status != EventStatus.CANCELLED.value,
    ).order_by(EventInquiry.event_date.asc()).all()
    venue_map = _venue_map(db)
    return [_serialize_event(e, venue_map) for e in items]


@router.post("/events")
def create_event(
    guest_name: str,
    phone: str,
    event_type: str = "wedding",
    email: str = "",
    event_date: Optional[str] = None,
    guests_count: int = 50,
    budget: str = "",
    quoted_amount: float = 0.0,
    venue_id: Optional[int] = None,
    requirements: str = "",
    notes: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_manager(current_user)
    ed = date.fromisoformat(event_date) if event_date else None
    if venue_id:
        venue = db.query(Venue).filter(Venue.id == venue_id).first()
        if not venue:
            raise HTTPException(status_code=400, detail="Selected venue does not exist")
    item = EventInquiry(
        guest_name=guest_name, phone=phone, email=email, event_type=event_type,
        event_date=ed, guests_count=guests_count, budget=budget,
        quoted_amount=quoted_amount, venue_id=venue_id,
        requirements=requirements, notes=notes,
        status=EventStatus.INQUIRY.value,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _serialize_event(item, _venue_map(db))


@router.patch("/events/{event_id}")
def update_event(
    event_id: int,
    guest_name: Optional[str] = None,
    phone: Optional[str] = None,
    email: Optional[str] = None,
    event_type: Optional[str] = None,
    event_date: Optional[str] = None,
    guests_count: Optional[int] = None,
    budget: Optional[str] = None,
    quoted_amount: Optional[float] = None,
    venue_id: Optional[int] = None,
    requirements: Optional[str] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_manager(current_user)
    item = db.query(EventInquiry).filter(EventInquiry.id == event_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")

    if guest_name is not None:
        item.guest_name = guest_name
    if phone is not None:
        item.phone = phone
    if email is not None:
        item.email = email
    if event_type is not None:
        item.event_type = event_type
    if event_date is not None:
        item.event_date = date.fromisoformat(event_date) if event_date else None
    if guests_count is not None:
        item.guests_count = guests_count
    if budget is not None:
        item.budget = budget
    if quoted_amount is not None:
        item.quoted_amount = quoted_amount
    if venue_id is not None:
        # venue_id of 0 clears the selection
        if venue_id == 0:
            item.venue_id = None
        else:
            venue = db.query(Venue).filter(Venue.id == venue_id).first()
            if not venue:
                raise HTTPException(status_code=400, detail="Selected venue does not exist")
            item.venue_id = venue_id
    if requirements is not None:
        item.requirements = requirements
    if notes is not None:
        item.notes = notes

    db.commit()
    db.refresh(item)
    return _serialize_event(item, _venue_map(db))


@router.post("/events/{event_id}/status")
def update_event_status(
    event_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_manager(current_user)
    valid = {s.value for s in EventStatus}
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(sorted(valid))}")
    item = db.query(EventInquiry).filter(EventInquiry.id == event_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    item.status = status
    db.commit()
    db.refresh(item)
    return _serialize_event(item, _venue_map(db))


@router.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Only admins can delete events")
    item = db.query(EventInquiry).filter(EventInquiry.id == event_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(item)
    db.commit()
    return {"success": True, "message": "Event deleted"}
