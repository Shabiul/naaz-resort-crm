import json
import re
from datetime import datetime, date
from typing import Optional

from sqlalchemy.orm import Session

from app.services.ai_service import get_ai_response
from app.services.booking_service import (
    check_room_availability,
    create_booking,
    create_guest_lead,
)


class VoiceAgentSession:
    def __init__(self, call_sid: str, caller_number: str):
        self.call_sid = call_sid
        self.caller_number = caller_number
        self.conversation_history = []
        self.guest_info = {}
        self.booking_data = {}
        self.stage = "greeting"
        self.db: Optional[Session] = None

    def set_db(self, db: Session):
        self.db = db

    def process_message(self, user_message: str) -> dict:
        self.conversation_history.append({"role": "user", "content": user_message})

        ai_response = get_ai_response(
            conversation_history=self.conversation_history,
            user_message=user_message,
            guest_info=self.booking_data,
        )

        self.conversation_history.append({"role": "assistant", "content": ai_response})

        action = self._detect_action(ai_response)

        if action["type"] == "booking_ready":
            self.stage = "confirming_booking"
        elif action["type"] == "lead_capture":
            self.stage = "capturing_lead"
        elif action["type"] == "booking_complete":
            pass

        return {
            "response": ai_response,
            "action": action,
            "stage": self.stage,
            "booking_data": self.booking_data,
        }

    def _detect_action(self, response: str) -> dict:
        if "[BOOKING_READY]" in response:
            data = self._extract_booking_data(response)
            return {"type": "booking_ready", "data": data}

        if "[LEAD_CAPTURE]" in response:
            data = self._extract_lead_data(response)
            return {"type": "lead_capture", "data": data}

        return {"type": "conversation", "data": {}}

    def _extract_booking_data(self, response: str) -> dict:
        data = {}
        patterns = {
            "guest_name": r"Guest\s*(?:Name)?[:\-]?\s*(.+?)(?:\n|$)",
            "check_in": r"Check[-\s]?in[:\-]?\s*(.+?)(?:\n|$)",
            "check_out": r"Check[-\s]?out[:\-]?\s*(.+?)(?:\n|$)",
            "room_type": r"Room\s*(?:Type)?[:\-]?\s*(.+?)(?:\n|$)",
        }
        for key, pattern in patterns.items():
            match = re.search(pattern, response, re.IGNORECASE)
            if match:
                data[key] = match.group(1).strip()

        # Parse guests count
        guests_match = re.search(r"Guests?[:\-]?\s*(.+?)(?:\n|$)", response, re.IGNORECASE)
        if guests_match:
            guests_text = guests_match.group(1).strip()
            adults_match = re.search(r"(\d+)\s*(?:Adult|A)", guests_text, re.IGNORECASE)
            children_match = re.search(r"(\d+)\s*(?:Child|C)", guests_text, re.IGNORECASE)
            if adults_match:
                data["adults"] = int(adults_match.group(1))
            if children_match:
                data["children"] = int(children_match.group(1))

        # Special requests
        sr_match = re.search(r"Special\s*(?:Requests)?[:\-]?\s*(.+?)(?:\n|$)", response, re.IGNORECASE)
        if sr_match:
            data["special_requests"] = sr_match.group(1).strip()

        return data

    def _extract_lead_data(self, response: str) -> dict:
        return self.guest_info

    def confirm_booking(self, db: Session) -> dict:
        try:
            check_in = datetime.strptime(self.booking_data.get("check_in", ""), "%Y-%m-%d").date()
            check_out = datetime.strptime(self.booking_data.get("check_out", ""), "%Y-%m-%d").date()
        except (ValueError, KeyError):
            check_in = date.today()
            check_out = date.today()
            # Try to parse from the booking data
            ci = self.booking_data.get("check_in", "")
            co = self.booking_data.get("check_out", "")
            if isinstance(ci, date):
                check_in = ci
            if isinstance(co, date):
                check_out = co

        booking = create_booking(
            db=db,
            guest_name=self.booking_data.get("guest_name", "Guest"),
            phone=self.booking_data.get("phone", self.caller_number),
            email=self.booking_data.get("email", ""),
            check_in=check_in,
            check_out=check_out,
            adults=int(self.booking_data.get("adults", 1)),
            children=int(self.booking_data.get("children", 0)),
            room_type=self.booking_data.get("room_type", "Standard Room"),
            special_requests=self.booking_data.get("special_requests", ""),
        )

        return {
            "success": True,
            "booking_id": booking.id,
            "total_amount": booking.total_amount,
            "message": f"Your reservation has been confirmed! Booking ID: {booking.id}. "
                       f"Total amount: ${booking.total_amount:.2f}. "
                       f"You will receive a confirmation email shortly.",
        }

    def capture_lead(self, db: Session) -> dict:
        lead = create_guest_lead(
            db=db,
            name=self.guest_info.get("name", "Unknown"),
            phone=self.caller_number,
            email=self.guest_info.get("email", ""),
            notes=self.guest_info.get("notes", ""),
            source="voice_call",
        )
        return {
            "success": True,
            "lead_id": lead.id,
            "message": "Thank you! We have noted your details and our team will reach out to you shortly.",
        }

    def to_dict(self):
        return {
            "call_sid": self.call_sid,
            "caller_number": self.caller_number,
            "booking_data": self.booking_data,
            "guest_info": self.guest_info,
            "stage": self.stage,
        }
