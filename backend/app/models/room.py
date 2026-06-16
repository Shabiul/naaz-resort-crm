from sqlalchemy import Column, Integer, String, Float, Boolean, Text

from app.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    room_type = Column(String(100), nullable=False)
    description = Column(Text, default="")
    price_per_night = Column(Float, nullable=False)
    max_adults = Column(Integer, default=2)
    max_children = Column(Integer, default=1)
    total_rooms = Column(Integer, default=5)
    available_rooms = Column(Integer, default=5)
    amenities = Column(String(500), default="")
    is_active = Column(Boolean, default=True)
