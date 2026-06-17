from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.models.booking import Booking, Invoice, InvoiceStatus
from app.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/invoices", tags=["invoices"])


def _require_staff(user):
    if user.role not in ("admin", "staff"):
        raise HTTPException(403, "Staff only")


def _next_invoice_number(db: Session) -> str:
    now = datetime.utcnow()
    prefix = f"INV-{now.strftime('%Y%m')}-"
    row = db.execute(
        text("SELECT invoice_number FROM invoices WHERE invoice_number LIKE :p ORDER BY invoice_number DESC LIMIT 1"),
        {"p": prefix + "%"},
    ).fetchone()
    n = (int(row[0].split("-")[-1]) + 1) if row else 1
    return f"{prefix}{n:04d}"


def _calc_gst(base: float) -> dict:
    igst_rate = settings.IGST_RATE
    if igst_rate > 0:
        igst = round(base * igst_rate / 100, 2)
        return dict(cgst_rate=0, sgst_rate=0, igst_rate=igst_rate,
                    cgst_amount=0, sgst_amount=0, igst_amount=igst,
                    total_gst=igst, total_amount=round(base + igst, 2))
    cr = settings.GST_RATE / 2
    cgst = round(base * cr / 100, 2)
    sgst = round(base * cr / 100, 2)
    total = round(cgst + sgst, 2)
    return dict(cgst_rate=cr, sgst_rate=cr, igst_rate=0,
                cgst_amount=cgst, sgst_amount=sgst, igst_amount=0,
                total_gst=total, total_amount=round(base + total, 2))


def _serialize(inv: Invoice) -> dict:
    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "booking_id": inv.booking_id,
        "guest_name": inv.guest_name,
        "guest_email": inv.guest_email,
        "guest_phone": inv.guest_phone,
        "room_type": inv.room_type,
        "check_in": str(inv.check_in) if inv.check_in else None,
        "check_out": str(inv.check_out) if inv.check_out else None,
        "nights": inv.nights,
        "base_amount": inv.base_amount,
        "cgst_rate": inv.cgst_rate,
        "sgst_rate": inv.sgst_rate,
        "igst_rate": inv.igst_rate,
        "cgst_amount": inv.cgst_amount,
        "sgst_amount": inv.sgst_amount,
        "igst_amount": inv.igst_amount,
        "total_gst": inv.total_gst,
        "total_amount": inv.total_amount,
        "status": inv.status,
        "notes": inv.notes,
        "issued_at": inv.issued_at.isoformat() if inv.issued_at else None,
        "created_at": inv.created_at.isoformat() if inv.created_at else None,
    }


@router.post("/generate/{booking_id}")
def generate_invoice(booking_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _require_staff(user)
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")

    inv = db.query(Invoice).filter(Invoice.booking_id == booking_id).first()
    if not inv:
        inv = Invoice(booking_id=booking_id, invoice_number=_next_invoice_number(db))
        db.add(inv)

    nights = (booking.check_out - booking.check_in).days if booking.check_in and booking.check_out else 1
    gst = _calc_gst(booking.total_amount)

    inv.guest_name = booking.guest_name
    inv.guest_email = booking.email
    inv.guest_phone = booking.phone
    inv.room_type = booking.room_type
    inv.check_in = booking.check_in
    inv.check_out = booking.check_out
    inv.nights = nights
    inv.base_amount = booking.total_amount
    inv.cgst_rate = gst["cgst_rate"]
    inv.sgst_rate = gst["sgst_rate"]
    inv.igst_rate = gst["igst_rate"]
    inv.cgst_amount = gst["cgst_amount"]
    inv.sgst_amount = gst["sgst_amount"]
    inv.igst_amount = gst["igst_amount"]
    inv.total_gst = gst["total_gst"]
    inv.total_amount = gst["total_amount"]
    inv.status = InvoiceStatus.ISSUED.value
    inv.issued_at = datetime.utcnow()

    db.commit()
    db.refresh(inv)
    return _serialize(inv)


@router.get("/by-booking/{booking_id}")
def get_by_booking(booking_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    inv = db.query(Invoice).filter(Invoice.booking_id == booking_id).first()
    if not inv:
        raise HTTPException(404, "No invoice for this booking")
    if user.role == "customer":
        b = db.query(Booking).filter(Booking.email == user.email, Booking.id == booking_id).first()
        if not b:
            raise HTTPException(403, "Access denied")
    return _serialize(inv)


@router.get("")
def list_invoices(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role in ("admin", "staff"):
        rows = db.query(Invoice).order_by(Invoice.id.desc()).all()
    elif user.role == "customer":
        bookings = db.query(Booking).filter(Booking.email == user.email).all()
        bid_set = [b.id for b in bookings]
        rows = db.query(Invoice).filter(Invoice.booking_id.in_(bid_set)).order_by(Invoice.id.desc()).all() if bid_set else []
    else:
        raise HTTPException(403, "Access denied")
    return [_serialize(r) for r in rows]


@router.get("/{inv_id}")
def get_invoice(inv_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    inv = db.query(Invoice).filter(Invoice.id == inv_id).first()
    if not inv:
        raise HTTPException(404, "Not found")
    if user.role == "customer":
        b = db.query(Booking).filter(Booking.email == user.email, Booking.id == inv.booking_id).first()
        if not b:
            raise HTTPException(403, "Access denied")
    return _serialize(inv)


@router.get("/{inv_id}/pdf")
def download_pdf(inv_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    inv = db.query(Invoice).filter(Invoice.id == inv_id).first()
    if not inv:
        raise HTTPException(404, "Not found")
    if user.role == "customer":
        b = db.query(Booking).filter(Booking.email == user.email, Booking.id == inv.booking_id).first()
        if not b:
            raise HTTPException(403, "Access denied")

    pdf_bytes = _build_pdf(inv)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{inv.invoice_number}.pdf"'},
    )


def _build_pdf(inv: Invoice) -> bytes:
    try:
        from fpdf import FPDF
    except ImportError:
        raise HTTPException(500, "fpdf2 not installed — run: pip install fpdf2")

    GREEN = (34, 85, 68)
    LIGHT = (245, 248, 250)
    WHITE = (255, 255, 255)
    BLACK = (30, 30, 30)
    GRAY = (110, 110, 110)

    def money(n):
        return f"INR {n:,.2f}"

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # ── Header bar ──────────────────────────────────────────────────────────
    pdf.set_fill_color(*GREEN)
    pdf.rect(0, 0, 210, 38, "F")

    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_xy(10, 8)
    pdf.cell(90, 10, "NAAZ RESORT", ln=False)

    pdf.set_font("Helvetica", "B", 13)
    pdf.set_xy(140, 8)
    pdf.cell(60, 10, "TAX INVOICE", ln=False, align="R")

    pdf.set_font("Helvetica", "", 8)
    pdf.set_xy(10, 20)
    pdf.cell(90, 5, settings.RESORT_ADDRESS or "Maharashtra, India", ln=False)
    pdf.set_xy(10, 26)
    gstin_text = f"GSTIN: {settings.GSTIN}" if settings.GSTIN else "GSTIN: (not configured)"
    pdf.cell(90, 5, gstin_text, ln=False)

    issued = inv.issued_at.strftime("%d %b %Y") if inv.issued_at else ""
    pdf.set_xy(110, 20)
    pdf.cell(90, 5, f"Invoice No: {inv.invoice_number}", ln=False, align="R")
    pdf.set_xy(110, 26)
    pdf.cell(90, 5, f"Date: {issued}", ln=False, align="R")

    # ── Billed To ────────────────────────────────────────────────────────────
    pdf.set_text_color(*BLACK)
    pdf.set_xy(10, 46)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(0, 6, "BILLED TO", ln=True)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_x(10)
    pdf.cell(0, 5, inv.guest_name or "—", ln=True)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*GRAY)
    if inv.guest_email:
        pdf.set_x(10)
        pdf.cell(0, 4, inv.guest_email, ln=True)
    if inv.guest_phone:
        pdf.set_x(10)
        pdf.cell(0, 4, inv.guest_phone, ln=True)

    # ── Booking details table ─────────────────────────────────────────────
    pdf.set_text_color(*WHITE)
    pdf.set_fill_color(*GREEN)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_xy(10, 80)
    pdf.cell(190, 7, "  BOOKING DETAILS", ln=True, fill=True)

    pdf.set_text_color(*BLACK)
    pdf.set_font("Helvetica", "", 9)
    details = [
        ("Room Type", inv.room_type or "—"),
        ("Booking #", str(inv.booking_id)),
        ("Check-in", str(inv.check_in) if inv.check_in else "—"),
        ("Check-out", str(inv.check_out) if inv.check_out else "—"),
        ("Nights", str(inv.nights)),
    ]
    for i, (label, val) in enumerate(details):
        pdf.set_fill_color(*LIGHT) if i % 2 == 0 else pdf.set_fill_color(*WHITE)
        pdf.cell(95, 6, f"  {label}", fill=True)
        pdf.cell(95, 6, val, fill=True, ln=True)

    # ── Amount breakdown ──────────────────────────────────────────────────
    pdf.ln(4)
    pdf.set_text_color(*WHITE)
    pdf.set_fill_color(*GREEN)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(190, 7, "  AMOUNT BREAKDOWN", ln=True, fill=True)

    pdf.set_text_color(*BLACK)
    pdf.set_font("Helvetica", "", 9)

    amt_rows = [("Taxable Amount (Room Charges)", money(inv.base_amount))]
    if inv.igst_rate > 0:
        amt_rows.append((f"IGST @ {inv.igst_rate}%", money(inv.igst_amount)))
    else:
        if inv.cgst_rate > 0:
            amt_rows.append((f"CGST @ {inv.cgst_rate}%", money(inv.cgst_amount)))
        if inv.sgst_rate > 0:
            amt_rows.append((f"SGST @ {inv.sgst_rate}%", money(inv.sgst_amount)))

    for i, (label, val) in enumerate(amt_rows):
        pdf.set_fill_color(*LIGHT) if i % 2 == 0 else pdf.set_fill_color(*WHITE)
        pdf.cell(130, 6, f"  {label}", fill=True)
        pdf.cell(60, 6, val, fill=True, align="R", ln=True)

    pdf.set_fill_color(*GREEN)
    pdf.set_text_color(*WHITE)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(130, 8, "  TOTAL AMOUNT", fill=True)
    pdf.cell(60, 8, money(inv.total_amount), fill=True, align="R", ln=True)

    # ── Note ─────────────────────────────────────────────────────────────
    pdf.set_text_color(*GRAY)
    pdf.set_font("Helvetica", "I", 7)
    pdf.ln(5)
    pdf.set_x(10)
    pdf.multi_cell(190, 4,
        "This is a computer-generated invoice and does not require a physical signature. "
        "All amounts are in Indian Rupees (INR). GST registered under the GSTIN shown above.")

    # ── Footer ────────────────────────────────────────────────────────────
    pdf.set_y(-20)
    pdf.set_fill_color(*LIGHT)
    pdf.set_text_color(*GRAY)
    pdf.set_font("Helvetica", "", 8)
    pdf.cell(190, 6, "Thank you for choosing Naaz Resort. We look forward to welcoming you again.", align="C")

    return bytes(pdf.output())
