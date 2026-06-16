import json
import re
from datetime import datetime, date
from typing import Optional

from sqlalchemy.orm import Session

from app.models.booking import ChatConversation, ChatMessage, GuestLead, Booking
from app.services.ai_service import get_ai_response
from app.services.local_ai import _detect_room

ROOM_PRICES = {"Standard Room": 120, "Deluxe Room": 200, "Suite": 350, "Villa": 550, "Presidential Suite": 1200}


def create_conversation(db: Session, source: str = "chat_widget") -> ChatConversation:
    conv = ChatConversation(source=source)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def add_message(db: Session, conversation_id: int, role: str, content: str) -> ChatMessage:
    msg = ChatMessage(conversation_id=conversation_id, role=role, content=content)
    db.add(msg)
    return msg


def get_conversation_messages(db: Session, conversation_id: int) -> list:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )


def _parse_date(raw: str) -> Optional[date]:
    raw = raw.lower().replace("th", "").replace("rd", "").replace("nd", "").replace("st", "")
    months = {"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
              "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12}
    for mname, mnum in months.items():
        if mname in raw:
            nums = re.findall(r'\d+', raw)
            if nums:
                return date(2026, mnum, int(nums[0]))
    nums = re.findall(r'\d{4}-\d{2}-\d{2}', raw)
    if nums:
        parts = nums[0].split("-")
        return date(int(parts[0]), int(parts[1]), int(parts[2]))
    return None


def extract_booking_details(db_messages: list, user_message: str) -> Optional[dict]:
    user_msgs = [m for m in db_messages if m["role"] == "user"]
    if len(user_msgs) < 2:
        return None

    def g(i):
        return user_msgs[i]["content"].strip() if len(user_msgs) > i else ""

    ci = _parse_date(g(4)) or date.today()
    co = _parse_date(g(5)) or date.today()
    ad = int(re.findall(r'\d+', g(6))[0]) if re.findall(r'\d+', g(6)) else 1
    ch = int(re.findall(r'\d+', g(7))[0]) if re.findall(r'\d+', g(7)) else 0

    room_type = "Standard Room"
    for i in range(len(user_msgs)):
        r = _detect_room(user_msgs[i]["content"])
        if r:
            room_type = r.title()
            break

    nights = max((co - ci).days, 1)
    total = ROOM_PRICES.get(room_type, 120) * nights

    return {
        "guest_name": g(1) or "Guest",
        "phone": g(2) or "",
        "email": g(3) or "",
        "check_in": ci,
        "check_out": co,
        "adults": ad,
        "children": ch,
        "room_type": room_type,
        "special_requests": user_message.strip() or "",
        "total_amount": total,
    }


def process_chat_message(
    db: Session,
    conversation_id: int,
    user_message: str,
    guest_info: Optional[dict] = None,
    source: str = "website",
) -> dict:
    conv = db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
    if not conv:
        return {"error": "Conversation not found"}

    msg_lower = user_message.strip().lower()
    is_confirm = any(w in msg_lower for w in ["yes", "confirm", "proceed", "correct", "right", "sure"])

    # Create booking if user confirms after summary
    if conv.status == "booking_ready" and is_confirm:
        raw = get_conversation_messages(db, conversation_id)
        msg_dicts = [{"role": m.role, "content": m.content} for m in raw]
        details = extract_booking_details(msg_dicts, user_message)
        if details:
            booking = Booking(
                guest_name=details["guest_name"],
                phone=details["phone"],
                email=details["email"],
                check_in=details["check_in"],
                check_out=details["check_out"],
                adults=details["adults"],
                children=details["children"],
                room_type=details["room_type"],
                special_requests=details["special_requests"],
                total_amount=details["total_amount"],
                status="pending",
            )
            db.add(booking)
            db.commit()
            db.refresh(booking)
            conv.booking_id = booking.id
            conv.status = "booked"
            db.commit()

            # Save messages
            add_message(db, conversation_id, "user", user_message)
            db.commit()
            ai_response = (
                f"Awesome! Your booking (#{booking.id}) is confirmed! "
                f"I've booked the {details['room_type']} for {details['guest_name']} "
                f"from {details['check_in']} to {details['check_out']}. "
                f"Total: ${details['total_amount']:.0f}. "
                f"Check-in is 2PM, check-out 11AM. "
                f"If you need airport transfers from Bangalore or anything else, just let me know!"
            )
            add_message(db, conversation_id, "assistant", ai_response)
            conv.updated_at = datetime.utcnow()
            db.commit()

            return {
                "conversation_id": conversation_id,
                "response": ai_response,
                "action": "booking_created",
                "booking_id": booking.id,
            }

    # Normal flow: save user message, commit so it's visible, then get AI response
    add_message(db, conversation_id, "user", user_message)
    db.commit()

    messages = get_conversation_messages(db, conversation_id)
    conversation_history = [{"role": m.role, "content": m.content} for m in messages]

    ai_response = get_ai_response(
        conversation_history=conversation_history,
        user_message=user_message,
        guest_info=guest_info or {},
        db=db,
        source=source,
    )

    add_message(db, conversation_id, "assistant", ai_response)
    conv.updated_at = datetime.utcnow()
    db.commit()

    action = "conversation"

    if "[BOOKING_READY]" in ai_response:
        action = "booking_ready"
        conv.status = "booking_ready"
        db.commit()

    if "[LEAD_CAPTURE]" in ai_response:
        action = "lead_capture"
        conv.status = "lead_captured"
        if guest_info and guest_info.get("name"):
            lead = GuestLead(
                name=guest_info.get("name", "Chat Guest"),
                phone=guest_info.get("phone", ""),
                email=guest_info.get("email", ""),
                source="chat_widget",
                notes=f"Captured from chat #{conversation_id}",
            )
            db.add(lead)
            db.commit()
            conv.lead_id = lead.id
            db.commit()

    return {"conversation_id": conversation_id, "response": ai_response, "action": action}


def get_all_conversations(db: Session, skip: int = 0, limit: int = 50) -> list:
    return (
        db.query(ChatConversation)
        .order_by(ChatConversation.updated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_conversation_detail(db: Session, conversation_id: int) -> Optional[dict]:
    conv = db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
    if not conv:
        return None

    messages = get_conversation_messages(db, conversation_id)

    return {
        "conversation": {
            "id": conv.id,
            "guest_name": conv.guest_name,
            "phone": conv.phone,
            "email": conv.email,
            "status": conv.status,
            "source": conv.source,
            "lead_id": conv.lead_id,
            "booking_id": conv.booking_id,
            "summary": conv.summary,
            "created_at": conv.created_at.isoformat() if conv.created_at else None,
            "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
        },
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ],
    }
