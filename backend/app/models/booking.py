from datetime import date, datetime

from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Float, Enum as SAEnum, Boolean
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"
    HOUSEKEEPING = "housekeeping"
    SPA = "spa"
    RESTAURANT = "restaurant"
    ROOMS = "rooms"
    MAINTENANCE = "maintenance"
    CUSTOMER = "customer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="")
    role = Column(String(50), default=UserRole.STAFF.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"


class RoomType(str, enum.Enum):
    STANDARD = "Standard Room"
    DELUXE = "Deluxe Room"
    SUITE = "Suite"
    VILLA = "Villa"
    PRESIDENTIAL = "Presidential Suite"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    guest_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    adults = Column(Integer, default=1)
    children = Column(Integer, default=0)
    room_type = Column(String(100), nullable=False)
    room_count = Column(Integer, default=1)
    special_requests = Column(Text, default="")
    status = Column(String(50), default=BookingStatus.PENDING.value)
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class GuestLead(Base):
    __tablename__ = "guest_leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), default="")
    check_in = Column(Date, nullable=True)
    check_out = Column(Date, nullable=True)
    adults = Column(Integer, default=1)
    children = Column(Integer, default=0)
    preference = Column(String(255), default="")
    notes = Column(Text, default="")
    source = Column(String(100), default="voice_call")
    created_at = Column(DateTime, default=datetime.utcnow)


class CallLog(Base):
    __tablename__ = "call_logs"

    id = Column(Integer, primary_key=True, index=True)
    call_sid = Column(String(255), unique=True, index=True)
    caller_number = Column(String(50))
    caller_name = Column(String(255), default="")
    duration = Column(Integer, default=0)
    status = Column(String(50), default="completed")
    transcript = Column(Text, default="")
    summary = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class SpaReservation(Base):
    __tablename__ = "spa_reservations"

    id = Column(Integer, primary_key=True, index=True)
    guest_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), default="")
    service = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(String(50), nullable=False)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class RestaurantReservation(Base):
    __tablename__ = "restaurant_reservations"

    id = Column(Integer, primary_key=True, index=True)
    guest_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), default="")
    guests = Column(Integer, default=2)
    date = Column(Date, nullable=False)
    time = Column(String(50), nullable=False)
    special_requests = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    guest_name = Column(String(255), default="Guest")
    phone = Column(String(50), default="")
    email = Column(String(255), default="")
    status = Column(String(50), default="active")
    source = Column(String(50), default="chat_widget")
    lead_id = Column(Integer, default=0)
    booking_id = Column(Integer, default=0)
    summary = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, nullable=False, index=True)
    role = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    extra_data = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class HousekeepingTask(Base):
    __tablename__ = "housekeeping_tasks"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String(50), nullable=False)
    task_type = Column(String(100), nullable=False)  # cleaning, turndown, maintenance, towels, amenities
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    status = Column(String(50), default="pending")  # pending, in_progress, completed
    assigned_to = Column(String(255), default="")
    guest_name = Column(String(255), default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class ActivityBooking(Base):
    __tablename__ = "activity_bookings"

    id = Column(Integer, primary_key=True, index=True)
    guest_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), default="")
    activity = Column(String(100), nullable=False)  # Trekking, ATV, Kayaking, Cycling, Safari, Bonfire
    date = Column(Date, nullable=False)
    time = Column(String(50), default="09:00")
    participants = Column(Integer, default=1)
    amount = Column(Float, default=0.0)
    status = Column(String(50), default="confirmed")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    guest_name = Column(String(255), nullable=False)
    phone = Column(String(50), default="")
    room_number = Column(String(50), default="")
    category = Column(String(100), default="general")  # room, food, staff, facilities, noise, billing
    description = Column(Text, nullable=False)
    priority = Column(String(20), default="normal")  # normal, high, critical
    status = Column(String(50), default="open")  # open, in_progress, resolved, closed
    assigned_to = Column(String(255), default="")
    resolution = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


class GuestLoyalty(Base):
    __tablename__ = "guest_loyalty"

    id = Column(Integer, primary_key=True, index=True)
    guest_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), default="")
    points = Column(Integer, default=0)
    tier = Column(String(20), default="silver")  # silver, gold, platinum
    total_stays = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    last_stay = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class EventInquiry(Base):
    __tablename__ = "event_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    guest_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), default="")
    event_type = Column(String(100), default="wedding")  # wedding, corporate, birthday, anniversary, conference
    event_date = Column(Date, nullable=True)
    guests_count = Column(Integer, default=50)
    budget = Column(String(100), default="")
    requirements = Column(Text, default="")
    status = Column(String(50), default="inquiry")  # inquiry, proposal_sent, confirmed, cancelled
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class UserHistory(Base):
    __tablename__ = "user_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # ID of the user this history is for
    username = Column(String(100), nullable=False)
    full_name = Column(String(255), default="")
    email = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)  # "created", "deleted"
    action_by = Column(String(100), nullable=False)  # Who did the action
    action_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)  # For deleted users, when they started
    ended_at = Column(DateTime, nullable=True)  # When they were deleted


class RequestCategory(str, enum.Enum):
    HOUSEKEEPING = "housekeeping"
    MAINTENANCE = "maintenance"
    RESTAURANT = "restaurant"
    SPA = "spa"
    COMPLAINT = "complaint"
    BOOKING = "booking"
    GENERAL = "general"
    EMERGENCY = "emergency"


class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RequestStatus(str, enum.Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CLOSED = "closed"


class RequestSource(str, enum.Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"
    VOICE_AGENT = "voice_agent"
    WHATSAPP = "whatsapp"


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    room_number = Column(String(50), default="")
    category = Column(String(50), nullable=False)
    priority = Column(String(20), default=Priority.MEDIUM.value)
    status = Column(String(50), default=RequestStatus.OPEN.value)
    assigned_role = Column(String(50), nullable=True)
    created_by_user_id = Column(Integer, nullable=True)
    source = Column(String(50), default=RequestSource.ADMIN.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
