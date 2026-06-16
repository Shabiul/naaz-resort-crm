from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.services.chat_service import (
    create_conversation,
    process_chat_message,
    get_all_conversations,
    get_conversation_detail,
)
from app.models.booking import ChatConversation

router = APIRouter(prefix="/api/chat", tags=["chat"])


class SendMessageRequest(BaseModel):
    conversation_id: int
    message: str
    source: str = "website"
    guest_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class NewConversationRequest(BaseModel):
    source: str = "chat_widget"
    guest_name: str = "Guest"
    phone: str = ""
    email: str = ""


@router.get("/db-test")
def api_db_test(db: Session = Depends(get_db)):
    """Debug endpoint to check database connectivity on Vercel."""
    try:
        from sqlalchemy import text
        result = db.execute(text("SELECT 1")).fetchone()
        return {"status": "ok", "result": result[0], "db_url": str(db.bind.url)}
    except Exception as e:
        import traceback
        return {"status": "error", "error": str(e), "traceback": traceback.format_exc()}


@router.post("/conversations")
def api_new_conversation(req: NewConversationRequest, db: Session = Depends(get_db)):
    try:
        conv = create_conversation(db, source=req.source)
        if req.guest_name:
            conv.guest_name = req.guest_name
            conv.phone = req.phone
            conv.email = req.email
            db.commit()
        return {
            "conversation_id": conv.id,
            "message": "Welcome to Naaz Resort! I'm your virtual assistant. How may I help you today?",
        }
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}


@router.post("/message")
def api_send_message(req: SendMessageRequest, db: Session = Depends(get_db)):
    conv = db.query(ChatConversation).filter(ChatConversation.id == req.conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Update guest info on the conversation if provided
    if req.guest_name and req.guest_name != "Guest":
        conv.guest_name = req.guest_name
    if req.phone:
        conv.phone = req.phone
    if req.email:
        conv.email = req.email
    db.commit()

    guest_info = {
        "name": conv.guest_name or "Guest",
        "phone": conv.phone or "",
        "email": conv.email or "",
    }

    result = process_chat_message(
        db=db,
        conversation_id=req.conversation_id,
        user_message=req.message,
        guest_info=guest_info,
        source=req.source,
    )

    return result


@router.get("/conversations")
def api_get_conversations(
    skip: int = 0, limit: int = 50, db: Session = Depends(get_db)
):
    convs = get_all_conversations(db, skip=skip, limit=limit)
    return [
        {
            "id": c.id,
            "guest_name": c.guest_name,
            "phone": c.phone,
            "email": c.email,
            "status": c.status,
            "source": c.source,
            "lead_id": c.lead_id,
            "booking_id": c.booking_id,
            "message_count": 0,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in convs
    ]


@router.get("/conversations/{conversation_id}")
def api_get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    result = get_conversation_detail(db, conversation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return result


@router.get("/messages/{conversation_id}")
def api_get_messages(conversation_id: int, db: Session = Depends(get_db)):
    result = get_conversation_detail(db, conversation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"messages": result["messages"]}
