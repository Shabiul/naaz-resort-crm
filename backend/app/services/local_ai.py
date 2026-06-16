"""
Local AI fallback — works without OpenAI API keys.
Supports both website guest chat and CRM admin queries.
"""
import re
from typing import Optional, List, Dict
from datetime import datetime, date
from sqlalchemy import func

ROOM_DATA = {
    "standard room": {"price": 120, "adults": 2, "children": 1},
    "deluxe room": {"price": 200, "adults": 2, "children": 2},
    "suite": {"price": 350, "adults": 3, "children": 2},
    "villa": {"price": 550, "adults": 4, "children": 3},
    "presidential suite": {"price": 1200, "adults": 4, "children": 2},
}

ROOM_NAMES = {
    "standard room": "Standard Room",
    "deluxe room": "Deluxe Room",
    "suite": "Suite",
    "villa": "Villa",
    "presidential suite": "Presidential Suite",
}


def _detect_room(text: str) -> Optional[str]:
    t = text.strip().lower()
    for rtype in sorted(ROOM_DATA.keys(), key=len, reverse=True):
        if rtype in t:
            return rtype
        kw = rtype.split()[0]
        if kw in t and kw not in ("room",):
            return rtype
    if "suite" in t:
        return "suite"
    if t.isdigit():
        idx = int(t) - 1
        keys = list(ROOM_DATA.keys())
        if 0 <= idx < len(keys):
            return keys[idx]
    return None


def _booking_step(user_msgs: list) -> Optional[int]:
    keywords = ["book", "reserve", "accommodation"]
    start = None
    for i, m in enumerate(user_msgs):
        if any(k in m["content"].lower() for k in keywords):
            start = i
            break
    if start is None:
        return None
    return len(user_msgs) - 1 - start


def get_local_response(
    user_message: str,
    guest_info: Optional[dict] = None,
    conversation_history: Optional[List[Dict]] = None,
    db: Optional[object] = None,
    source: str = "website",
) -> str:
    msg_lower = user_message.strip().lower()
    is_booking_intent = any(k in msg_lower for k in ["book", "reserve", "accommodation"])

    # CRM query handler — skip if user wants to book
    if source == "crm" and not is_booking_intent:
        crm_response = _handle_crm_query(user_message, db)
        if crm_response:
            return crm_response

    msg = msg_lower
    user_msgs = [m for m in conversation_history if m["role"] == "user"]
    step = _booking_step(user_msgs)

    if step is None:
        if len(user_msgs) == 1:
            return (
                "Hey! Raj here from Naaz Resort, sitting in Bangalore. "
                "How can I help you? Want to book a room, or ask me anything about the place!"
            )
        return _handle_general_query(msg)

    # Booking flow steps:
    # 0: just detected intent → ask name
    # 1: user gave name → ask phone
    # 2: user gave phone → ask email
    # 3: user gave email → ask check-in
    # 4: user gave check-in → ask check-out
    # 5: user gave check-out → ask adults
    # 6: user gave adults → ask children
    # 7: user gave children → recommend room
    # 8: user chose room → ask requests
    # 9: user gave requests → summary
    # 10+: confirmation

    if step == 0:
        return "Awesome! Let's get you booked. What's your name, boss?"

    if step == 1:
        name = user_msgs[-1]["content"].strip()
        first = name.split()[0] if name.split() else "there"
        return f"Nice to meet you, {first}! Give me your number so I can keep you updated yeah?"

    if step == 2:
        return "Perfect! And your email ID please, I'll send the confirmation across."

    if step == 3:
        return "Great! When are you planning to check in?"

    if step == 4:
        return "And checkout date?"

    if step == 5:
        return "How many adults?"

    if step == 6:
        return "Any kids coming? How many? That helps me recommend the right room."

    if step == 7:
        return (
            "Based on your group, here's what I'd suggest:\n"
            "Couple? Standard Room at $120, cozy n budget-friendly.\n"
            "Family with kids? Deluxe Room at $200 fits 2+2 perfectly.\n"
            "Bigger group? Suite ($350, 3+2) or Villa ($550, 4+3).\n"
            "Wanna go all out? Presidential Suite at $1,200.\n\n"
            "Which one sounds good?"
        )

    if step == 8:
        selected = _detect_room(msg)
        if selected:
            return (
                f"Nice choice! The {ROOM_NAMES[selected]} is solid. "
                "Any special requests? Airport pickup from Bangalore, room decoration, dietary stuff?"
            )
        return (
            "Based on your group, here's what I'd suggest:\n"
            "Couple? Standard Room at $120, cozy n budget-friendly.\n"
            "Family with kids? Deluxe Room at $200 fits 2+2 perfectly.\n"
            "Bigger group? Suite ($350, 3+2) or Villa ($550, 4+3).\n"
            "Wanna go all out? Presidential Suite at $1,200.\n\n"
            "Which one sounds good?"
        )

    if step == 9:
        room_already = any(_detect_room(m["content"]) for m in user_msgs[:-1])
        if not room_already:
            selected = _detect_room(msg)
            if selected:
                return (
                    f"Nice choice! The {ROOM_NAMES[selected]} is solid. "
                    "Any special requests? Airport pickup from Bangalore, room decoration, dietary stuff?"
                )
            return (
                "Based on your group, here's what I'd suggest:\n"
                "Couple? Standard Room at $120, cozy n budget-friendly.\n"
                "Family with kids? Deluxe Room at $200 fits 2+2 perfectly.\n"
                "Bigger group? Suite ($350, 3+2) or Villa ($550, 4+3).\n"
                "Wanna go all out? Presidential Suite at $1,200.\n\n"
                "Which one sounds good?"
            )

    # step >= 10: summary or confirmation
    if step >= 9:
        def get(i):
            return user_msgs[i]["content"].strip() if len(user_msgs) > i else ""

        gname = get(1) or "Guest"
        phone = get(2) or ""
        email = get(3) or ""
        ci = get(4) or "N/A"
        co = get(5) or "N/A"
        ad = get(6) or "?"
        ch = get(7) or "0"

        rt_raw = "Standard Room"
        for m in user_msgs:
            d = _detect_room(m["content"])
            if d:
                rt_raw = ROOM_NAMES[d]
                break

        if any(w in msg for w in ["yes", "confirm", "proceed", "correct", "right", "sure"]):
            return "Awesome! Your booking is confirmed! I'll send the details to your email. If you need airport transfers from Bangalore or anything else, just ping me. Looking forward to having you at Naaz Resort!"

        if any(w in msg for w in ["no", "change", "wrong", "incorrect", "cancel", "different"]):
            return "No problem boss! Let's start over. What would you like to do?"

        return (
            f"[BOOKING_READY]\n"
            f"Here's your booking summary:\n"
            f"Name: {gname}\n"
            f"Phone: {phone}\n"
            f"Email: {email}\n"
            f"Check-in: {ci} | Check-out: {co}\n"
            f"Guests: {ad} Adults, {ch} Kids\n"
            f"Room: {rt_raw}\n"
            f"Requests: {user_message.strip()}\n\n"
            "Looks good? Say yes to confirm, or tell me what you'd like to change."
        )

    return "I'm here to help! Rooms, bookings, pool, spa, restaurant, activities — just ask!"


def _handle_crm_query(msg: str, db) -> Optional[str]:
    if db is None:
        return None
    msg_lower = msg.strip().lower()
    from app.models.booking import Booking, GuestLead, CallLog, ChatConversation
    today = date.today()

    if any(w in msg_lower for w in ["dashboard", "summary", "overview", "how many", "count", "total"]):
        tb = db.query(Booking).count()
        cb = db.query(Booking).filter(Booking.status == "confirmed").count()
        xb = db.query(Booking).filter(Booking.status == "cancelled").count()
        bt = db.query(Booking).filter(func.date(Booking.created_at) == today).count()
        tl = db.query(GuestLead).count()
        tc = db.query(CallLog).count()
        tch = db.query(ChatConversation).count()
        ach = db.query(ChatConversation).filter(ChatConversation.status == "active").count()
        return (
            "CRM Dashboard Summary\n"
            f"Bookings: {tb} total | Confirmed: {cb} | Cancelled: {xb} | Today: {bt}\n"
            f"Leads: {tl} | Call Logs: {tc} | Chats: {tch} total, {ach} active\n"
            "What would you like to see? Bookings, leads, rooms, call logs, or chats?"
        )

    if "booking" in msg_lower:
        import re
        id_match = re.search(r'#?\s*(\d{1,5})', msg_lower)
        if id_match:
            b = db.query(Booking).filter(Booking.id == int(id_match.group(1))).first()
            if b:
                return (
                    f"Booking #{b.id}: {b.guest_name}\n"
                    f"Room: {b.room_type} | {b.check_in} to {b.check_out}\n"
                    f"Guests: {b.adults or '?'} adults, {b.children or '0'} children\n"
                    f"Status: {b.status}\n"
                    f"Phone: {b.phone or 'N/A'} | Email: {b.email or 'N/A'}\n"
                    f"Requests: {b.special_requests or 'None'}\n"
                    f"Total: ${b.total_amount or '?'} | Created: {b.created_at}"
                )
            return f"Booking #{id_match.group(1)} not found."
        name_match = re.search(r'(?:for|of|by|about|named?|called?)\s+(\w+(?:\s+\w+)?)', msg_lower)
        if name_match:
            search = name_match.group(1)
            bookings = db.query(Booking).filter(Booking.guest_name.ilike(f'%{search}%')).order_by(Booking.created_at.desc()).all()
            if bookings:
                return "\n".join([f"#{b.id} — {b.guest_name} | {b.room_type} | {b.status}" for b in bookings])
            return f"No bookings found for '{search}'."
        status_filter = None
        if any(w in msg_lower for w in ["confirmed", "active"]):
            status_filter = "confirmed"
        elif "cancelled" in msg_lower or "cancel" in msg_lower:
            status_filter = "cancelled"
        elif "pending" in msg_lower:
            status_filter = "pending"
        query = db.query(Booking)
        if status_filter:
            query = query.filter(Booking.status == status_filter)
        if "today" in msg_lower:
            query = query.filter(func.date(Booking.created_at) == today)
        bookings = query.order_by(Booking.created_at.desc()).limit(10).all()
        if not bookings:
            return "No bookings found."
        lines = [f"#{b.id} — {b.guest_name} | {b.room_type} | {b.status}" for b in bookings]
        return "\n".join(lines) + "\n\nSay 'booking #ID' for details."

    if "lead" in msg_lower:
        id_match = re.search(r'#?\s*(\d{1,5})', msg_lower)
        if id_match:
            l = db.query(GuestLead).filter(GuestLead.id == int(id_match.group(1))).first()
            if l:
                return f"Lead #{l.id}: {l.name} | {l.phone or 'N/A'} | {l.email or 'N/A'} | Source: {l.source or 'N/A'}"
            return f"Lead #{id_match.group(1)} not found."
        name_match = re.search(r'(?:for|of|by|about|named?|called?)\s+(\w+(?:\s+\w+)?)', msg_lower)
        if name_match:
            leads = db.query(GuestLead).filter(GuestLead.name.ilike(f'%{name_match.group(1)}%')).order_by(GuestLead.created_at.desc()).all()
            if leads:
                return "\n".join([f"#{l.id} — {l.name} | {l.phone or 'N/A'}" for l in leads])
            return f"No leads for '{name_match.group(1)}'."
        leads = db.query(GuestLead).order_by(GuestLead.created_at.desc()).limit(10).all()
        if not leads:
            return "No leads found."
        return "\n".join([f"#{l.id} — {l.name} | {l.phone or 'No phone'}" for l in leads])

    if any(w in msg_lower for w in ["room", "availability", "free room", "vacant"]):
        from app.models.room import Room
        type_filter = None
        for rt in ["standard", "deluxe", "suite", "villa", "presidential"]:
            if rt in msg_lower:
                type_filter = rt.title() + (" Room" if rt in ["standard", "deluxe"] else "")
                if rt == "presidential":
                    type_filter = "Presidential Suite"
                break
        query = db.query(Room)
        if type_filter:
            query = query.filter(Room.room_type.ilike(f'%{type_filter}%'))
        if "available" in msg_lower or "free" in msg_lower or "vacant" in msg_lower:
            query = query.filter(Room.available_rooms > 0)
        rooms = query.all()
        if not rooms:
            return f"No rooms{' for ' + type_filter if type_filter else ''} found."
        lines = [f"{'Available ' if 'available' in msg_lower else ''}Rooms:"]
        for r in rooms:
            lines.append(f"{r.name} (${r.price_per_night}/night) — {r.available_rooms}/{r.total_rooms} free")
        return "\n".join(lines)

    if any(w in msg_lower for w in ["call log", "call", "phone log"]):
        logs = db.query(CallLog).order_by(CallLog.created_at.desc()).limit(10).all()
        if not logs:
            return "No call logs found."
        return "\n".join([f"{l.caller_number or 'Unknown'} ({l.caller_name or 'Unknown'}) | {l.status or 'N/A'} | {l.duration or 'N/A'}s" for l in logs])

    if any(w in msg_lower for w in ["chat", "conversation"]):
        chats = db.query(ChatConversation).order_by(ChatConversation.updated_at.desc()).limit(10).all()
        if not chats:
            return "No chats found."
        return "\n".join([f"#{c.id} — {c.guest_name or 'Guest'} | {c.status}" for c in chats])

    return None


def _handle_general_query(msg: str) -> str:
    if any(w in msg for w in ["hello", "hi", "hey", "namaste", "good morning", "good afternoon"]):
        return "Hey! Raj here from Naaz Resort. What can I do for you?"

    if any(w in msg for w in ["room", "suite", "villa", "accommodation"]):
        return (
            "We got options for every kinda group:\n"
            "Couple? Standard Room at $120 — simple n sweet.\n"
            "Family w kids? Deluxe Room at $200 or Suite at $350.\n"
            "Big squad? Villa at $550 — plenty of space.\n"
            "Feeling rich? Presidential Suite at $1,200.\n"
            "Tell me who's coming, I'll recommend the best fit!"
        )

    if any(w in msg for w in ["price", "cost", "rate", "how much"]):
        return "Rooms from $120 (Standard) to $1,200 (Presidential). Sweet spot for most families is the Deluxe at $200. Want me to check availability for your dates?"

    if any(w in msg for w in ["pool", "amenities"]):
        return "Infinity pool by the ocean, open 6 AM to 10 PM. Private cabanas, poolside service. It's beautiful yaar!"

    if "spa" in msg:
        return "Spa open 9 AM to 8 PM. Massages, facials, hot stone, couple therapy — starting $120. The deep tissue is amazing. Want me to book?"

    if any(w in msg for w in ["restaurant", "dining", "food", "breakfast", "dinner"]):
        return "Multi-cuisine restaurant, 7 AM to 11 PM. Breakfast buffet, lunch, candlelight dinner with ocean view. The seafood is legit. Want a table reserved?"

    if any(w in msg for w in ["check-in", "check in", "check-out", "check out"]):
        return "Check-in from 2 PM, check-out by 11 AM. Early/late? Just let me know."

    if any(w in msg for w in ["activity", "activities", "adventure", "sport", "tour"]):
        return "Snorkeling, jet skiing, parasailing, nature walks, cycling tours, cultural shows, cooking classes. Lots to do! Which one interests you?"

    if any(w in msg for w in ["contact", "phone", "call", "number", "email", "address"]):
        return "+91-555-123-4567 or reservations@naazresort.com. Front desk 24/7."

    if any(w in msg for w in ["airport", "transfer", "pickup", "transport"]):
        return "We do airport transfers! Free if you're staying 5+ nights. Need me to arrange from Bangalore?"

    if any(w in msg for w in ["thank", "thanks"]):
        return "Anytime! That's what I'm here for. Anything else?"

    if any(w in msg for w in ["bye", "goodbye", "see you"]):
        return "Take care! Ping me anytime. Raj signing off!"

    return "I'm here to help! Rooms, bookings, pool, spa, restaurant, activities — just ask!"
