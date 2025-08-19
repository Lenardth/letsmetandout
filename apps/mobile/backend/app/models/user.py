from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON
from sqlalchemy.sql import func
from app.utils.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, index=True)
    avatar_url = Column(String)
    location = Column(String)
    join_date = Column(DateTime, default=func.now())
    rating = Column(Float, default=0.0)
    total_meetups = Column(Integer, default=0)
    groups_joined = Column(Integer, default=0)
    safety_score = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    safety_settings = Column(JSON, default={
        "location_sharing": True,
        "safety_checkins": True,
        "emergency_alerts": True,
        "group_verification": True
    })
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
