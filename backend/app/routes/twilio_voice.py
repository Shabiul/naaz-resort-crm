import json
from datetime import datetime

from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from twilio.twiml.voice_response import VoiceResponse, Gather, Say, Redirect

from app.database import get_db
from app.config import settings
from app.services.voice_agent import VoiceAgentSession
from app.services.booking_service import create_call_log
from pydantic import BaseModel

router = APIRouter(prefix="/twilio", tags=["twilio"])

# Store active sessions (in production, use Redis)
active_sessions: dict[str, VoiceAgentSession] = {}


@router.post("/voice")
async def handle_incoming_call(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    call_sid = form.get("CallSid", "")
    caller_number = form.get("From", "")

    session = VoiceAgentSession(call_sid=call_sid, caller_number=caller_number)
    session.set_db(db)
    active_sessions[call_sid] = session

    response = VoiceResponse()
    gather = Gather(
        input="speech",
        timeout=5,
        speech_timeout="auto",
        action=f"{settings.BASE_URL}/twilio/process-speech/{call_sid}",
        method="POST",
        language="en-US",
        enhanced=True,
    )

    gather.say(
        "Welcome to Naaz Resort. I'm your virtual guest assistant. "
        "How may I help you today? You can say things like "
        "I'd like to make a booking, check room availability, or ask about our amenities.",
        voice="Polly.Joanna-Neural",
        language="en-US",
    )

    response.append(gather)
    response.redirect(f"{settings.BASE_URL}/twilio/voice", method="POST")

    return response


@router.post("/process-speech/{call_sid}")
async def process_speech(call_sid: str, request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    speech_result = form.get("SpeechResult", "")

    if call_sid not in active_sessions:
        return VoiceResponse().say("I'm sorry, your session has expired. Please call again.")

    session = active_sessions[call_sid]
    result = session.process_message(speech_result)

    response = VoiceResponse()

    action = result.get("action", {})
    action_type = action.get("type", "conversation")

    if action_type == "booking_ready":
        gather = Gather(
            input="speech",
            timeout=5,
            speech_timeout="auto",
            action=f"{settings.BASE_URL}/twilio/confirm-booking/{call_sid}",
            method="POST",
            language="en-US",
            enhanced=True,
        )
        clean_text = result["response"].replace("[BOOKING_READY]", "").strip()
        gather.say(
            f"{clean_text} Please say confirm to proceed, or cancel to start over.",
            voice="Polly.Joanna-Neural",
            language="en-US",
        )
        response.append(gather)

    elif action_type == "lead_capture":
        clean_text = result["response"].replace("[LEAD_CAPTURE]", "").strip()

        lead_result = session.capture_lead(db)
        clean_text += f" {lead_result['message']}"

        say = Say(clean_text, voice="Polly.Joanna-Neural", language="en-US")
        response.append(say)
        response.hangup()

    elif action_type == "conversation":
        gather = Gather(
            input="speech",
            timeout=5,
            speech_timeout="auto",
            action=f"{settings.BASE_URL}/twilio/process-speech/{call_sid}",
            method="POST",
            language="en-US",
            enhanced=True,
        )
        gather.say(result["response"], voice="Polly.Joanna-Neural", language="en-US")
        response.append(gather)

    return response


@router.post("/confirm-booking/{call_sid}")
async def confirm_booking(call_sid: str, request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    speech_result = form.get("SpeechResult", "").lower().strip()

    if call_sid not in active_sessions:
        return VoiceResponse().say("Session expired. Please call again.")

    session = active_sessions[call_sid]
    response = VoiceResponse()

    if "confirm" in speech_result or "yes" in speech_result:
        booking_result = session.confirm_booking(db)

        # Log the call
        create_call_log(
            db=db,
            call_sid=call_sid,
            caller_number=session.caller_number,
            caller_name=session.booking_data.get("guest_name", ""),
            duration=0,
            status="booking_confirmed",
            summary=f"Booking confirmed - {json.dumps(session.booking_data)}",
        )

        say = Say(
            f"{booking_result['message']} "
            "A confirmation will be sent to your email. "
            "Thank you for choosing Naaz Resort. We look forward to welcoming you! "
            "Have a wonderful day!",
            voice="Polly.Joanna-Neural",
            language="en-US",
        )
        response.append(say)
        response.hangup()

        # Clean up session
        del active_sessions[call_sid]

    elif "cancel" in speech_result or "no" in speech_result:
        say = Say(
            "No problem at all. Feel free to call us back anytime you'd like to make a reservation. "
            "Thank you for calling Naaz Resort. Have a great day!",
            voice="Polly.Joanna-Neural",
            language="en-US",
        )
        response.append(say)
        response.hangup()
        del active_sessions[call_sid]

    else:
        gather = Gather(
            input="speech",
            timeout=5,
            speech_timeout="auto",
            action=f"{settings.BASE_URL}/twilio/confirm-booking/{call_sid}",
            method="POST",
            language="en-US",
            enhanced=True,
        )
        gather.say(
            "I didn't quite catch that. Please say confirm to proceed with the booking, "
            "or cancel to start over.",
            voice="Polly.Joanna-Neural",
            language="en-US",
        )
        response.append(gather)

    return response


class OutboundCallRequest(BaseModel):
    phone: str
    guest_name: str = "Guest"


@router.post("/outbound-call")
async def initiate_outbound_call(req: OutboundCallRequest, db: Session = Depends(get_db)):
    """
    Initiate an outbound call to a guest's phone number (supports Indian +91 numbers).
    When answered, connects to the AI voice agent.
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        return {
            "success": False,
            "message": "Twilio is not configured. In demo mode, your call request has been logged.",
            "demo_mode": True,
            "phone": req.phone,
            "guest_name": req.guest_name,
        }

    try:
        from twilio.rest import Client

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        # Format phone number (ensure +91 prefix for Indian numbers)
        phone = req.phone.strip()
        if not phone.startswith("+"):
            if phone.startswith("91"):
                phone = f"+{phone}"
            elif phone.startswith("0"):
                phone = f"+91{phone[1:]}"
            else:
                phone = f"+91{phone}"

        call = client.calls.create(
            url=f"{settings.BASE_URL}/twilio/voice",
            to=phone,
            from_=settings.TWILIO_PHONE_NUMBER,
            status_callback=f"{settings.BASE_URL}/twilio/status-callback",
            status_callback_event=["completed", "answered", "busy", "no-answer", "failed"],
        )

        create_call_log(
            db=db,
            call_sid=call.sid,
            caller_number=phone,
            caller_name=req.guest_name,
            status="initiated",
            summary=f"Outbound call initiated to {phone}",
        )

        return {
            "success": True,
            "call_sid": call.sid,
            "phone": phone,
            "message": f"Call initiated to {phone}. The AI receptionist will connect shortly.",
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to initiate call. Please try again.",
        }


@router.post("/status-callback")
async def status_callback(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    call_sid = form.get("CallSid", "")
    call_status = form.get("CallStatus", "")
    duration = form.get("CallDuration", 0)

    if call_sid in active_sessions:
        session = active_sessions[call_sid]
        create_call_log(
            db=db,
            call_sid=call_sid,
            caller_number=session.caller_number,
            caller_name=session.booking_data.get("guest_name", ""),
            duration=int(duration) if duration else 0,
            status=call_status,
            summary=f"Call ended. Status: {call_status}",
        )
        del active_sessions[call_sid]

    return {"status": "ok"}
