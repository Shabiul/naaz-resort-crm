# Naaz Resort Voice Agent - Resort Management System

A complete resort management system with AI voice agent, booking management, and role-based authentication.

## Features

### Backend (FastAPI)
- FastAPI backend with SQLAlchemy ORM
- JWT-based authentication system
- Role-based access control (Admin, Staff, Housekeeping, Spa, Restaurant, Rooms, Maintenance, Customer)
- Booking management
- Guest management
- AI chat and voice agent integration
- Spa, restaurant, activities management
- Housekeeping, complaints, loyalty, events
- **Service Request Management** (New!)

### Frontend (React + Vite)
- Admin dashboard (React + Tailwind CSS)
- Customer-facing website (React + Tailwind CSS)
- Role-based navigation and protected routes
- Beautiful, responsive UI
- **Service Requests page** (New!)
- **Updated My Requests page for customers** (New!)

## Service Request Management (New!)

A complete service request system with:
- Auto-assignment based on category
- Role-based access control
- Multiple categories (Housekeeping, Maintenance, Restaurant, Spa, Complaint, Booking, General, Emergency)
- Priority levels (Low, Medium, High, Critical)
- Status tracking (Open, Assigned, In Progress, Completed, Closed)
- Source tracking (Admin, Customer, Voice Agent, WhatsApp)

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Backend Setup

#### Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Environment Variables
Create a `.env` file in the `backend` directory (you can copy from `.env.example`):
```env
# Server
DEBUG=true
BASE_URL=http://localhost:8000

# Twilio (for voice calls)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI (for AI conversation)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Deepgram (for speech-to-text, optional)
DEEPGRAM_API_KEY=your_deepgram_api_key

# ElevenLabs (for text-to-speech, optional)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production-please-12345678901234567890
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./naaz_resort.db
```

#### Start the backend server
```bash
cd backend
uvicorn main:app --reload
```

The backend will be available at: `http://localhost:8000`

API docs: `http://localhost:8000/docs`

#### Seed the database
To initialize the database with sample rooms and an admin user, send a POST request to:
```
POST http://localhost:8000/seed/init
```

This will create:
- All sample room types
- Default admin user:
  - Username: `admin`
  - Password: `admin123`
- Staff users (housekeeping, spa, restaurant, rooms, maintenance)
- Sample service requests

### 2. Frontend Setup (Admin Dashboard)

#### Install dependencies
```bash
cd frontend
npm install
```

#### Start the dev server
```bash
cd frontend
npm run dev
```

The admin dashboard will be available at: `http://localhost:5173/crm`

### 3. Frontend Website (Customer Facing)

#### Install dependencies
```bash
cd frontend-website
npm install
```

#### Start the dev server
```bash
cd frontend-website
npm run dev
```

The customer website will be available at: `http://localhost:5174` (or check the terminal output)

## Authentication System

### User Roles
1. **Admin**: Full access to all features
2. **Staff**: Limited access (bookings, leads, chat, rooms, spa, restaurant, activities, service requests)
3. **Housekeeping**: Access to housekeeping tasks and housekeeping service requests
4. **Spa**: Access to spa bookings and spa service requests
5. **Restaurant**: Access to restaurant bookings and restaurant service requests
6. **Rooms**: Access to rooms, bookings, and booking service requests
7. **Maintenance**: Access to housekeeping tasks and maintenance service requests
8. **Customer**: Minimal access (dashboard, my bookings, my requests)

### Default Credentials
- **Admin**: Username `admin`, Password `admin123`
- **Staff**: Username `receptionist`, Password `staff123`
- **Housekeeping**: Username `housekeeper`, Password `staff123`
- **Spa**: Username `spa_therapist`, Password `staff123`
- **Restaurant**: Username `restaurant_manager`, Password `staff123`
- **Rooms**: Username `room_attendant`, Password `staff123`
- **Maintenance**: Username `maintenance`, Password `staff123`

### Creating New Users
1. Log in as an admin
2. Go to the "Users" page
3. Click "Add User"
4. Fill out the form and select a role

### API Endpoints (Auth)
- `POST /api/auth/login`: Log in and get JWT token
- `POST /api/auth/register`: Create new user (admin only)
- `GET /api/auth/me`: Get current user info
- `GET /api/auth/users`: Get all users (admin only)

### API Endpoints (Service Requests)
- `POST /api/service-requests`: Create new service request
- `GET /api/service-requests`: Get all service requests (with filters)
- `GET /api/service-requests/{id}`: Get specific service request
- `PATCH /api/service-requests/{id}`: Update service request
- `PATCH /api/service-requests/{id}/assign`: Assign service request (admin only)
- `PATCH /api/service-requests/{id}/status`: Update request status
- `DELETE /api/service-requests/{id}`: Delete service request (admin only)

## Project Structure

```
NIIT/
├── backend/
│   ├── api/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   │   └── service_requests.py (New!)
│   │   ├── services/
│   │   ├── config.py
│   │   └── database.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   └── ServiceRequests.jsx (New!)
│   │   └── services/
│   └── package.json
└── frontend-website/
    ├── src/
    │   ├── components/
    │   └── pages/
    └── package.json
```

## License
MIT
