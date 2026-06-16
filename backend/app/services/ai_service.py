import json
from typing import Optional, List, Dict

from openai import OpenAI

from app.config import settings
from app.services.local_ai import get_local_response

def get_client():
    if not settings.OPENAI_API_KEY:
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """You are the official AI Receptionist and Voice Agent for Naaz Resort, a luxury resort.

YOUR PERSONALITY:
- Warm, welcoming, and professional
- Friendly and conversational
- Knowledgeable about the resort
- Speak naturally like a luxury receptionist
- Use short, concise sentences
- Never sound robotic

RESORT INFORMATION:
- Naaz Resort offers luxury accommodations including Standard Rooms, Deluxe Rooms, Suites, Villas, and a Presidential Suite
- Amenities: Swimming pool, world-class spa, fine dining restaurant, adventure sports, sightseeing tours, free Wi-Fi, valet parking
- Check-in: 2:00 PM | Check-out: 11:00 AM
- Restaurant: Open 7:00 AM - 11:00 PM (multi-cuisine)
- Spa: Open 9:00 AM - 8:00 PM
- Activities: Water sports, trekking, cycling, cultural shows, cooking classes
- Airport transfers available upon request

PRICING (per night):
- Standard Room: $120
- Deluxe Room: $200
- Suite: $350
- Villa: $550
- Presidential Suite: $1,200

YOUR CAPABILITIES:
You can help with:
1. Room bookings and reservations
2. Checking room availability
3. Answering questions about the resort
4. Restaurant, spa, and activity reservations
5. Special requests (romantic decoration, airport pickup, etc.)
6. Providing recommendations

CONVERSATION FLOW:
1. Greet the guest warmly
2. Understand their needs
3. Collect booking details one at a time
4. Suggest suitable options
5. Confirm details before proceeding

COLLECT THESE DETAILS FOR BOOKINGS (one at a time):
- Full Name
- Phone Number
- Email Address
- Check-in Date
- Check-out Date
- Number of Adults
- Number of Children
- Room Preference
- Special Requests

IMPORTANT RULES:
- Ask only ONE question at a time
- Keep responses brief and natural
- Confirm all details before finalizing
- If asked something you don't know, offer to take details and follow up
- Always be polite and professional
- When you have all booking details, respond with: [BOOKING_READY] followed by a summary
- When capturing a lead who is not ready to book: [LEAD_CAPTURE]
- Never make promises you cannot verify
- Sound like a real person, not an automated system
- For upsells: naturally suggest premium rooms, spa packages, airport transfers, or romantic decorations when appropriate

FUNCTIONS YOU CAN USE:
- checkRoomAvailability(room_type, check_in, check_out)
- createBooking(guest_name, phone, email, check_in, check_out, adults, children, room_type, special_requests)
- bookSpaSession(guest_name, phone, email, service, date, time)
- reserveRestaurant(guest_name, phone, email, guests, date, time)
- createLead(name, phone, email, notes)
"""


def get_ai_response(
    conversation_history: list,
    user_message: str,
    guest_info: Optional[dict] = None,
    db: Optional[object] = None,
    source: str = "website",
) -> str:
    client = get_client()

    # Use real AI if configured
    if client is not None:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if guest_info:
            info_str = json.dumps(guest_info)
            messages.append({
                "role": "system",
                "content": f"Current guest information collected so far: {info_str}"
            })

        for msg in conversation_history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=300,
        )

        return response.choices[0].message.content.strip()

    # Use local AI fallback when no API key
    return get_local_response(
        user_message=user_message,
        guest_info=guest_info,
        conversation_history=conversation_history,
        db=db,
        source=source,
    )


def transcribe_audio(audio_path: str) -> str:
    if not settings.DEEPGRAM_API_KEY:
        return "Transcription not available - Deepgram API key not configured."

    try:
        import deepgram
        dg_client = deepgram.Deepgram(settings.DEEPGRAM_API_KEY)
        with open(audio_path, "rb") as audio:
            source = {"buffer": audio, "mimetype": "audio/wav"}
            response = dg_client.transcription.sync_prerecorded(source, {"punctuate": True})
        return response["results"]["channels"][0]["alternatives"][0]["transcript"]
    except ImportError:
        return "Deepgram SDK not installed. Please install deepgram-sdk."
    except Exception as e:
        return f"Transcription error: {str(e)}"
