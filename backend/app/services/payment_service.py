"""Razorpay payment abstraction.

Runs in two modes:
  * "live"  - when RAZORPAY_KEY_ID/SECRET are configured and the razorpay
              package is installed. Real orders, signature verification, refunds.
  * "mock"  - otherwise. Generates fake order/payment ids and accepts any
              verification, so the whole flow works locally without secrets.
"""
import hmac
import hashlib
import time
import uuid

from app.config import settings

try:  # razorpay is optional; mock mode works without it
    import razorpay
except ImportError:  # pragma: no cover
    razorpay = None


def _keys_present() -> bool:
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)


def payment_mode() -> str:
    return "live" if (_keys_present() and razorpay is not None) else "mock"


def is_mock() -> bool:
    return payment_mode() == "mock"


def _client():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def public_config() -> dict:
    return {
        "mode": payment_mode(),
        "key_id": settings.RAZORPAY_KEY_ID if payment_mode() == "live" else "",
        "currency": settings.RAZORPAY_CURRENCY,
    }


def create_order(amount: float, receipt: str, notes: dict | None = None) -> dict:
    """amount is in major units (e.g. rupees). Razorpay expects the smallest unit."""
    amount_minor = int(round(amount * 100))
    if is_mock():
        return {
            "order_id": f"order_mock_{uuid.uuid4().hex[:16]}",
            "amount": amount_minor,
            "currency": settings.RAZORPAY_CURRENCY,
            "mock": True,
        }
    order = _client().order.create({
        "amount": amount_minor,
        "currency": settings.RAZORPAY_CURRENCY,
        "receipt": receipt,
        "notes": notes or {},
        "payment_capture": 1,
    })
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "mock": False,
    }


def verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    if is_mock():
        return True
    try:
        _client().utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })
        return True
    except Exception:
        return False


def mock_signature(order_id: str, payment_id: str) -> str:
    """Deterministic fake signature for the mock flow (mirrors Razorpay's HMAC)."""
    msg = f"{order_id}|{payment_id}".encode()
    secret = (settings.RAZORPAY_KEY_SECRET or "mock_secret").encode()
    return hmac.new(secret, msg, hashlib.sha256).hexdigest()


def new_mock_payment_id() -> str:
    return f"pay_mock_{uuid.uuid4().hex[:16]}"


def refund(payment_id: str, amount: float | None = None) -> dict:
    if is_mock():
        return {"id": f"rfnd_mock_{uuid.uuid4().hex[:12]}", "status": "processed", "mock": True}
    kwargs = {}
    if amount is not None:
        kwargs["amount"] = int(round(amount * 100))
    result = _client().payment.refund(payment_id, kwargs)
    return {"id": result.get("id"), "status": result.get("status"), "mock": False}
