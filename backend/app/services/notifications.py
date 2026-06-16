import urllib.parse
from app.config import settings


def _fmt_phone_wa(phone: str) -> str:
    digits = "".join(c for c in phone if c.isdigit())
    if len(digits) == 10:
        return "91" + digits
    return digits


def get_whatsapp_link(booking) -> str:
    phone = _fmt_phone_wa(booking.phone or "")
    nights = (booking.check_out - booking.check_in).days if booking.check_in and booking.check_out else 0
    msg = (
        f"Dear {booking.guest_name}, your booking at Naaz Resort is CONFIRMED! "
        f"Booking ID: #{booking.id} | Room: {booking.room_type} | "
        f"Check-in: {booking.check_in} | Check-out: {booking.check_out} | "
        f"Nights: {nights} | Total: ${booking.total_amount:.0f}. "
        f"We look forward to welcoming you!"
    )
    return f"https://wa.me/{phone}?text={urllib.parse.quote(msg)}"


def send_booking_confirmation_email(booking) -> bool:
    if not settings.SENDGRID_API_KEY or not settings.RESORT_FROM_EMAIL:
        return False
    if not booking.email:
        return False
    try:
        import urllib.request, json
        nights = (booking.check_out - booking.check_in).days if booking.check_in and booking.check_out else 0
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#c47f17;color:white;padding:24px;text-align:center">
            <h1 style="margin:0;font-size:24px">Naaz Resort</h1>
            <p style="margin:4px 0 0;opacity:.85">Booking Confirmation</p>
          </div>
          <div style="padding:32px;background:#fff">
            <h2 style="color:#1e293b">Dear {booking.guest_name},</h2>
            <p style="color:#475569">Your reservation has been confirmed. We look forward to welcoming you!</p>
            <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:24px 0">
              <table style="width:100%;font-size:14px">
                <tr><td style="color:#64748b;padding:4px 0">Booking ID</td><td style="font-weight:600">#{booking.id}</td></tr>
                <tr><td style="color:#64748b;padding:4px 0">Room Type</td><td>{booking.room_type}</td></tr>
                <tr><td style="color:#64748b;padding:4px 0">Check-in</td><td>{booking.check_in}</td></tr>
                <tr><td style="color:#64748b;padding:4px 0">Check-out</td><td>{booking.check_out}</td></tr>
                <tr><td style="color:#64748b;padding:4px 0">Nights</td><td>{nights}</td></tr>
                <tr><td style="color:#64748b;padding:4px 0">Guests</td><td>{booking.adults} adults, {booking.children} children</td></tr>
                <tr><td style="color:#64748b;padding:4px 0;font-weight:600">Total Amount</td><td style="font-weight:600;color:#c47f17">${booking.total_amount:.0f}</td></tr>
              </table>
            </div>
            <p style="color:#475569;font-size:13px">Check-in: 2:00 PM &nbsp;|&nbsp; Check-out: 11:00 AM</p>
            <p style="color:#94a3b8;font-size:12px;margin-top:32px">For assistance: reservations@naazresort.com</p>
          </div>
        </div>
        """
        payload = json.dumps({
            "personalizations": [{"to": [{"email": booking.email, "name": booking.guest_name}]}],
            "from": {"email": settings.RESORT_FROM_EMAIL, "name": "Naaz Resort"},
            "subject": f"Booking Confirmed — #{booking.id} | Naaz Resort",
            "content": [{"type": "text/html", "value": html}],
        }).encode()
        req = urllib.request.Request(
            "https://api.sendgrid.com/v3/mail/send",
            data=payload,
            headers={"Authorization": f"Bearer {settings.SENDGRID_API_KEY}", "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=8) as r:
            return r.status in (200, 202)
    except Exception:
        return False
