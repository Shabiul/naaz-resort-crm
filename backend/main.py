from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, Response

from app.config import settings
from app.database import init_db
from app.routes import twilio_voice, admin_api, seed, chat, auth, service_requests
from app.models.booking import (
    Booking, GuestLead, CallLog, SpaReservation, RestaurantReservation,
    HousekeepingTask, ActivityBooking, Complaint, GuestLoyalty, EventInquiry
)
from app.models.room import Room

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(service_requests.router)
app.include_router(twilio_voice.router)
app.include_router(admin_api.router)
app.include_router(seed.router)
app.include_router(chat.router)

WWW_DIR = Path(__file__).resolve().parent / "www-dist"
CRM_DIR = Path(__file__).resolve().parent / "crm-dist"


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/health")
def api_health():
    return {"status": "healthy"}


if WWW_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(WWW_DIR / "assets")), name="www_assets")

    @app.get("/")
    def serve_website():
        return FileResponse(str(WWW_DIR / "index.html"))

_NO_CACHE = {"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"}

if CRM_DIR.exists():
    app.mount("/crm/assets", StaticFiles(directory=str(CRM_DIR / "assets")), name="crm_assets")

    @app.get("/crm")
    def serve_crm_index():
        content = (CRM_DIR / "index.html").read_bytes()
        return Response(content=content, media_type="text/html", headers=_NO_CACHE)

    @app.get("/crm/{path:path}")
    def serve_crm_spa(path: str):
        fp = CRM_DIR / path
        if fp.exists() and fp.is_file():
            return FileResponse(str(fp))
        content = (CRM_DIR / "index.html").read_bytes()
        return Response(content=content, media_type="text/html", headers=_NO_CACHE)


if WWW_DIR.exists():
    @app.get("/{path:path}")
    def serve_www_spa(path: str):
        fp = WWW_DIR / path
        if fp.exists() and fp.is_file():
            return FileResponse(str(fp))
        return FileResponse(str(WWW_DIR / "index.html"))
