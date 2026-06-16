import json
from datetime import date, datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.booking import Booking, GuestLead, SpaReservation, RestaurantReservation, CallLog, BookingStatus, RoomType
from app.models.room import Room


def check_room_availability(
    db: Session,
    room_type: Optional[str] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
) -> list:
    query = db.query(Room).filter(Room.is_active == True)

    if room_type:
        query = query.filter(Room.room_type == room_type)

    rooms = query.all()

    result = []
    for room in rooms:
        # Count overlapping confirmed bookings for this room type
        if check_in and check_out:
            conflicting = (
                db.query(Booking)
                .filter(
                    Booking.room_type == room.room_type,
                    Booking.status.in_([BookingStatus.CONFIRMED.value, BookingStatus.PENDING.value]),
                    Booking.check_in < check_out,
                    Booking.check_out > check_in,
                )
                .count()
            )
            available = room.total_rooms - conflicting
        else:
            available = room.available_rooms

        result.append({
            "id": room.id,
            "name": room.name,
            "room_type": room.room_type,
            "description": room.description,
            "price_per_night": room.price_per_night,
            "max_adults": room.max_adults,
            "max_children": room.max_children,
            "available_rooms": max(0, available),
            "amenities": room.amenities.split(",") if room.amenities else [],
        })

    return result


def get_price_for_room_type(room_type: str) -> float:
    prices = {
        RoomType.STANDARD.value: 120,
        RoomType.DELUXE.value: 200,
        RoomType.SUITE.value: 350,
        RoomType.VILLA.value: 550,
        RoomType.PRESIDENTIAL.value: 1200,
    }
    return prices.get(room_type, 0)


def create_booking(
    db: Session,
    guest_name: str,
    phone: str,
    email: str,
    check_in: date,
    check_out: date,
    adults: int,
    children: int,
    room_type: str,
    special_requests: str = "",
    status: str = BookingStatus.PENDING.value,
) -> Booking:
    nights = (check_out - check_in).days
    price_per_night = get_price_for_room_type(room_type)
    total = price_per_night * nights

    booking = Booking(
        guest_name=guest_name,
        phone=phone,
        email=email,
        check_in=check_in,
        check_out=check_out,
        adults=adults,
        children=children,
        room_type=room_type,
        special_requests=special_requests,
        status=status,
        total_amount=total,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def create_guest_lead(
    db: Session,
    name: str,
    phone: str,
    email: str = "",
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    adults: int = 1,
    children: int = 0,
    preference: str = "",
    notes: str = "",
    source: str = "voice_call",
) -> GuestLead:
    lead = GuestLead(
        name=name,
        phone=phone,
        email=email,
        check_in=check_in,
        check_out=check_out,
        adults=adults,
        children=children,
        preference=preference,
        notes=notes,
        source=source,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def create_call_log(
    db: Session,
    call_sid: str,
    caller_number: str,
    caller_name: str = "",
    duration: int = 0,
    status: str = "completed",
    transcript: str = "",
    summary: str = "",
) -> CallLog:
    log = CallLog(
        call_sid=call_sid,
        caller_number=caller_number,
        caller_name=caller_name,
        duration=duration,
        status=status,
        transcript=transcript,
        summary=summary,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def book_spa_session(
    db: Session,
    guest_name: str,
    phone: str,
    email: str,
    service: str,
    date: date,
    time: str,
    notes: str = "",
) -> SpaReservation:
    reservation = SpaReservation(
        guest_name=guest_name,
        phone=phone,
        email=email,
        service=service,
        date=date,
        time=time,
        notes=notes,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def reserve_restaurant(
    db: Session,
    guest_name: str,
    phone: str,
    email: str,
    guests: int,
    date: date,
    time: str,
    special_requests: str = "",
) -> RestaurantReservation:
    reservation = RestaurantReservation(
        guest_name=guest_name,
        phone=phone,
        email=email,
        guests=guests,
        date=date,
        time=time,
        special_requests=special_requests,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def get_booking_by_id(db: Session, booking_id: int) -> Optional[Booking]:
    return db.query(Booking).filter(Booking.id == booking_id).first()


def cancel_booking(db: Session, booking_id: int) -> Optional[Booking]:
    booking = get_booking_by_id(db, booking_id)
    if booking:
        booking.status = BookingStatus.CANCELLED.value
        db.commit()
        db.refresh(booking)
    return booking


def get_all_bookings(db: Session, skip: int = 0, limit: int = 100) -> list:
    return db.query(Booking).order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()


def get_all_leads(db: Session, skip: int = 0, limit: int = 100) -> list:
    return db.query(GuestLead).order_by(GuestLead.created_at.desc()).offset(skip).limit(limit).all()


def get_all_call_logs(db: Session, skip: int = 0, limit: int = 100) -> list:
    return db.query(CallLog).order_by(CallLog.created_at.desc()).offset(skip).limit(limit).all()
