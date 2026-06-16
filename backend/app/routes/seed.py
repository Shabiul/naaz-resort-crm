from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db, init_db
from app.models.room import Room
from app.models.booking import (
    User, UserRole, Booking, BookingStatus,
    GuestLead, CallLog, SpaReservation, RestaurantReservation,
    ChatConversation, ChatMessage, HousekeepingTask, ActivityBooking,
    Complaint, GuestLoyalty, EventInquiry, UserHistory,
    ServiceRequest, RequestCategory, Priority, RequestStatus, RequestSource
)
from app.services.auth_service import get_password_hash

router = APIRouter(prefix="/seed", tags=["seed"])


@router.post("/init")
def seed_database(db: Session = Depends(get_db)):
    init_db()

    existing_rooms = db.query(Room).count()
    if existing_rooms == 0:
        rooms = [
            Room(
                name="Standard Room",
                room_type="Standard Room",
                description="Comfortable room with modern amenities. Perfect for budget-conscious travelers.",
                price_per_night=120,
                max_adults=2,
                max_children=1,
                total_rooms=10,
                available_rooms=10,
                amenities="Wi-Fi,TV,Air Conditioning, Mini Bar, Room Service",
            ),
            Room(
                name="Deluxe Room",
                room_type="Deluxe Room",
                description="Spacious room with premium furnishings and garden view.",
                price_per_night=200,
                max_adults=2,
                max_children=2,
                total_rooms=8,
                available_rooms=8,
                amenities="Wi-Fi,TV,Air Conditioning, Mini Bar, Room Service, Balcony, Garden View",
            ),
            Room(
                name="Suite",
                room_type="Suite",
                description="Luxurious suite with separate living area and panoramic views.",
                price_per_night=350,
                max_adults=3,
                max_children=2,
                total_rooms=5,
                available_rooms=5,
                amenities="Wi-Fi,TV,Air Conditioning, Mini Bar, Room Service, Living Area, Balcony, Ocean View, Jacuzzi",
            ),
            Room(
                name="Villa",
                room_type="Villa",
                description="Private villa with personal pool, garden, and butler service.",
                price_per_night=550,
                max_adults=4,
                max_children=3,
                total_rooms=3,
                available_rooms=3,
                amenities="Wi-Fi,TV,Air Conditioning, Full Bar, Private Pool, Garden, Butler Service, Kitchen, Ocean View",
            ),
            Room(
                name="Presidential Suite",
                room_type="Presidential Suite",
                description="Our finest accommodation with panoramic ocean views, private terrace, and personalized concierge.",
                price_per_night=1200,
                max_adults=4,
                max_children=2,
                total_rooms=2,
                available_rooms=2,
                amenities="Wi-Fi,TV,Air Conditioning,Full Bar,Private Pool,Butler Service,Personal Concierge,Terrace,Ocean View,Jacuzzi,Private Chef",
            ),
        ]

        for room in rooms:
            db.add(room)
        db.commit()

    # Check for existing admin user
    existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if not existing_admin:
        admin_user = User(
            username="admin",
            email="admin@naazresort.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Administrator",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        
        # Log admin creation in history
        admin_history = UserHistory(
            user_id=admin_user.id,
            username=admin_user.username,
            full_name=admin_user.full_name,
            email=admin_user.email,
            role=admin_user.role,
            action="created",
            action_by="system",
            started_at=admin_user.created_at
        )
        db.add(admin_history)

    # Add dummy staff users
    existing_staff = db.query(User).filter(User.role.in_([
        UserRole.STAFF, UserRole.HOUSEKEEPING, UserRole.SPA,
        UserRole.RESTAURANT, UserRole.ROOMS, UserRole.MAINTENANCE
    ])).count()
    if existing_staff == 0:
        staff_users = [
            User(
                username="receptionist",
                email="reception@naazresort.com",
                hashed_password=get_password_hash("staff123"),
                full_name="Jane Smith",
                role=UserRole.STAFF,
                is_active=True
            ),
            User(
                username="housekeeper",
                email="housekeeping@naazresort.com",
                hashed_password=get_password_hash("staff123"),
                full_name="Mike Johnson",
                role=UserRole.HOUSEKEEPING,
                is_active=True
            ),
            User(
                username="spa_therapist",
                email="spa@naazresort.com",
                hashed_password=get_password_hash("staff123"),
                full_name="Sarah Lee",
                role=UserRole.SPA,
                is_active=True
            ),
            User(
                username="restaurant_manager",
                email="restaurant@naazresort.com",
                hashed_password=get_password_hash("staff123"),
                full_name="David Chen",
                role=UserRole.RESTAURANT,
                is_active=True
            ),
            User(
                username="room_attendant",
                email="rooms@naazresort.com",
                hashed_password=get_password_hash("staff123"),
                full_name="Emily Brown",
                role=UserRole.ROOMS,
                is_active=True
            ),
            User(
                username="maintenance",
                email="maintenance@naazresort.com",
                hashed_password=get_password_hash("staff123"),
                full_name="Tom Wilson",
                role=UserRole.MAINTENANCE,
                is_active=True
            )
        ]
        for user in staff_users:
            db.add(user)
        db.commit()
        
        # Log staff creation in history
        for user in staff_users:
            staff_history = UserHistory(
                user_id=user.id,
                username=user.username,
                full_name=user.full_name,
                email=user.email,
                role=user.role,
                action="created",
                action_by="system",
                started_at=user.created_at
            )
            db.add(staff_history)

    today = date.today()

    # Add dummy bookings
    existing_bookings = db.query(Booking).count()
    if existing_bookings == 0:
        bookings = [
            Booking(
                guest_name="John Doe",
                phone="+1234567890",
                email="john@example.com",
                check_in=today,
                check_out=today + timedelta(days=3),
                adults=2,
                children=1,
                room_type="Deluxe Room",
                room_count=1,
                special_requests="Extra towels please",
                status=BookingStatus.CONFIRMED,
                total_amount=600.0
            ),
            Booking(
                guest_name="Alice Smith",
                phone="+1987654321",
                email="alice@example.com",
                check_in=today + timedelta(days=5),
                check_out=today + timedelta(days=7),
                adults=3,
                children=0,
                room_type="Suite",
                room_count=1,
                status=BookingStatus.PENDING,
                total_amount=700.0
            )
        ]
        for booking in bookings:
            db.add(booking)

    # Add dummy guest leads
    existing_leads = db.query(GuestLead).count()
    if existing_leads == 0:
        leads = [
            GuestLead(
                name="Bob Wilson",
                phone="+1122334455",
                email="bob@example.com",
                check_in=today + timedelta(days=10),
                check_out=today + timedelta(days=14),
                adults=2,
                children=2,
                preference="Garden view room",
                notes="Interested in spa package",
                source="website"
            ),
            GuestLead(
                name="Carol Davis",
                phone="+1223344556",
                preference="Quiet floor",
                source="voice_call"
            )
        ]
        for lead in leads:
            db.add(lead)

    # Add dummy spa reservations
    existing_spa = db.query(SpaReservation).count()
    if existing_spa == 0:
        spa_reservations = [
            SpaReservation(
                guest_name="John Doe",
                phone="+1234567890",
                email="john@example.com",
                service="Swedish Massage",
                date=today,
                time="14:00",
                notes="Deep pressure"
            ),
            SpaReservation(
                guest_name="Alice Smith",
                phone="+1987654321",
                service="Facial Treatment",
                date=today + timedelta(days=2),
                time="10:00"
            )
        ]
        for reservation in spa_reservations:
            db.add(reservation)

    # Add dummy restaurant reservations
    existing_restaurant = db.query(RestaurantReservation).count()
    if existing_restaurant == 0:
        restaurant_reservations = [
            RestaurantReservation(
                guest_name="John Doe",
                phone="+1234567890",
                email="john@example.com",
                guests=4,
                date=today,
                time="19:30",
                special_requests="Birthday celebration"
            ),
            RestaurantReservation(
                guest_name="Jane Smith",
                phone="+1112223334",
                guests=2,
                date=today + timedelta(days=1),
                time="20:00",
                special_requests="Vegetarian options"
            )
        ]
        for reservation in restaurant_reservations:
            db.add(reservation)

    # Add dummy housekeeping tasks
    existing_housekeeping = db.query(HousekeepingTask).count()
    if existing_housekeeping == 0:
        tasks = [
            HousekeepingTask(
                room_number="101",
                task_type="cleaning",
                priority="normal",
                status="pending",
                guest_name="John Doe"
            ),
            HousekeepingTask(
                room_number="105",
                task_type="towels",
                priority="high",
                status="in_progress",
                notes="Guest requested extra towels"
            ),
            HousekeepingTask(
                room_number="201",
                task_type="maintenance",
                priority="urgent",
                status="pending",
                notes="AC not working"
            )
        ]
        for task in tasks:
            db.add(task)

    # Add dummy activity bookings
    existing_activities = db.query(ActivityBooking).count()
    if existing_activities == 0:
        activities = [
            ActivityBooking(
                guest_name="John Doe",
                phone="+1234567890",
                email="john@example.com",
                activity="Trekking",
                date=today + timedelta(days=1),
                time="08:00",
                participants=2,
                amount=100.0,
                status="confirmed"
            ),
            ActivityBooking(
                guest_name="Alice Smith",
                phone="+1987654321",
                activity="Kayaking",
                date=today + timedelta(days=3),
                time="14:00",
                participants=3,
                amount=150.0
            )
        ]
        for activity in activities:
            db.add(activity)

    # Add dummy complaints
    existing_complaints = db.query(Complaint).count()
    if existing_complaints == 0:
        complaints = [
            Complaint(
                guest_name="John Doe",
                phone="+1234567890",
                room_number="101",
                category="noise",
                description="Too much noise from the hallway last night.",
                priority="high",
                status="in_progress",
                assigned_to="Mike Johnson"
            ),
            Complaint(
                guest_name="Alice Smith",
                category="food",
                description="Breakfast was cold.",
                priority="normal",
                status="resolved",
                resolution="Complimentary dinner offered"
            )
        ]
        for complaint in complaints:
            db.add(complaint)

    # Add dummy loyalty members
    existing_loyalty = db.query(GuestLoyalty).count()
    if existing_loyalty == 0:
        loyalty_members = [
            GuestLoyalty(
                guest_name="John Doe",
                phone="+1234567890",
                email="john@example.com",
                points=5000,
                tier="gold",
                total_stays=8,
                total_spent=3500.0,
                last_stay=today - timedelta(days=30)
            ),
            GuestLoyalty(
                guest_name="Alice Smith",
                phone="+1987654321",
                email="alice@example.com",
                points=15000,
                tier="platinum",
                total_stays=20,
                total_spent=12000.0,
                last_stay=today - timedelta(days=10)
            )
        ]
        for member in loyalty_members:
            db.add(member)

    # Add dummy event inquiries
    existing_events = db.query(EventInquiry).count()
    if existing_events == 0:
        events = [
            EventInquiry(
                guest_name="Robert Brown",
                phone="+1333444555",
                email="robert@example.com",
                event_type="wedding",
                event_date=today + timedelta(days=90),
                guests_count=150,
                budget="$50,000",
                requirements="Outdoor venue, catering, music",
                status="proposal_sent"
            ),
            EventInquiry(
                guest_name="XYZ Corp",
                phone="+1444555666",
                event_type="conference",
                guests_count=100,
                requirements="Meeting room, AV equipment",
                status="inquiry"
            )
        ]
        for event in events:
            db.add(event)

    # Add dummy call logs
    existing_calls = db.query(CallLog).count()
    if existing_calls == 0:
        calls = [
            CallLog(
                call_sid="CA123456789",
                caller_number="+1123456789",
                caller_name="Bob Wilson",
                duration=320,
                status="completed",
                summary="Inquired about room availability for next month"
            ),
            CallLog(
                call_sid="CA987654321",
                caller_number="+1987654321",
                duration=180,
                status="completed",
                summary="Booked a spa appointment"
            )
        ]
        for call in calls:
            db.add(call)

    # Add dummy service requests
    existing_requests = db.query(ServiceRequest).count()
    if existing_requests == 0:
        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        requests = [
            ServiceRequest(
                request_number=f"SR{date.today().strftime('%Y%m%d')}0001",
                title="Room Cleaning Request",
                description="Guest in 101 needs their room cleaned urgently",
                room_number="101",
                category=RequestCategory.HOUSEKEEPING.value,
                priority=Priority.HIGH.value,
                status=RequestStatus.ASSIGNED.value,
                assigned_role=UserRole.HOUSEKEEPING.value,
                created_by_user_id=admin_user.id,
                source=RequestSource.ADMIN.value
            ),
            ServiceRequest(
                request_number=f"SR{date.today().strftime('%Y%m%d')}0002",
                title="AC Not Working",
                description="Air conditioning in room 205 is not cooling",
                room_number="205",
                category=RequestCategory.MAINTENANCE.value,
                priority=Priority.CRITICAL.value,
                status=RequestStatus.IN_PROGRESS.value,
                assigned_role=UserRole.MAINTENANCE.value,
                created_by_user_id=admin_user.id,
                source=RequestSource.ADMIN.value
            ),
            ServiceRequest(
                request_number=f"SR{date.today().strftime('%Y%m%d')}0003",
                title="Dinner Reservation",
                description="Need a table for 4 at 7 PM tonight",
                room_number="103",
                category=RequestCategory.RESTAURANT.value,
                priority=Priority.MEDIUM.value,
                status=RequestStatus.ASSIGNED.value,
                assigned_role=UserRole.RESTAURANT.value,
                created_by_user_id=admin_user.id,
                source=RequestSource.ADMIN.value
            ),
            ServiceRequest(
                request_number=f"SR{date.today().strftime('%Y%m%d')}0004",
                title="Spa Appointment",
                description="Guest wants to book a massage for tomorrow at 11 AM",
                room_number="110",
                category=RequestCategory.SPA.value,
                priority=Priority.LOW.value,
                status=RequestStatus.OPEN.value,
                assigned_role=UserRole.SPA.value,
                created_by_user_id=admin_user.id,
                source=RequestSource.VOICE_AGENT.value
            ),
            ServiceRequest(
                request_number=f"SR{date.today().strftime('%Y%m%d')}0005",
                title="Late Checkout Request",
                description="Guest would like to check out at 2 PM instead of 12 PM",
                room_number="202",
                category=RequestCategory.BOOKING.value,
                priority=Priority.MEDIUM.value,
                status=RequestStatus.OPEN.value,
                created_by_user_id=admin_user.id,
                source=RequestSource.WHATSAPP.value
            )
        ]
        for req in requests:
            db.add(req)

    db.commit()

    return {"message": f"Seeded database successfully! Admin: admin/admin123, Staff: staff123"}
