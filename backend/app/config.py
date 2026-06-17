import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_DEFAULT_DB = f"sqlite:///{_PROJECT_ROOT / 'naaz_resort.db'}"


class Settings:
    APP_NAME: str = "Naaz Resort Voice Agent"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")

    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    ELEVENLABS_VOICE_ID: str = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")

    DATABASE_URL: str = os.getenv("DATABASE_URL", _DEFAULT_DB)

    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")

    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    RESORT_FROM_EMAIL: str = os.getenv("RESORT_FROM_EMAIL", "reservations@naazresort.com")

    # GST / Invoice
    GST_RATE: float = float(os.getenv("GST_RATE", "12.0"))   # total %; split equally as CGST+SGST
    IGST_RATE: float = float(os.getenv("IGST_RATE", "0.0"))  # set = GST_RATE for inter-state
    GSTIN: str = os.getenv("GSTIN", "")
    RESORT_ADDRESS: str = os.getenv("RESORT_ADDRESS", "Maharashtra, India")

    # Razorpay (leave blank to run payments in mock mode)
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    RAZORPAY_CURRENCY: str = os.getenv("RAZORPAY_CURRENCY", "INR")

    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production-please-12345678901234567890")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


settings = Settings()
