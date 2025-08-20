"""
User model for SafeMeet application
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.database import Base
from enum import Enum as PyEnum
from datetime import datetime


class UserStatus(PyEnum):
    PENDING_VERIFICATION = "pending_verification"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DEACTIVATED = "deactivated"


class VerificationLevel(PyEnum):
    BASIC = "basic"  # Phone + Email verified
    STANDARD = "standard"  # + ID document verified
    PREMIUM = "premium"  # + Background check


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Location Information
    address = Column(Text)
    city = Column(String(100))
    province = Column(String(100))
    
    # Identity Information
    id_number = Column(String(13), unique=True, index=True)  # SA ID number
    
    # Status and Verification
    status = Column(Enum(UserStatus), default=UserStatus.PENDING_VERIFICATION)
    verification_level = Column(Enum(VerificationLevel), default=VerificationLevel.BASIC)
    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)
    id_verified = Column(Boolean, default=False)
    background_check_passed = Column(Boolean, default=False)
    
    # Preferences and Interests
    interests = Column(JSON, default=list)  # List of interest IDs
    safety_preferences = Column(JSON, default=dict)  # Safety preference settings
    
    # Agreement Flags
    terms_accepted = Column(Boolean, default=False)
    privacy_accepted = Column(Boolean, default=False)
    safety_guidelines_accepted = Column(Boolean, default=False)
    
    # Profile Information
    profile_photo_url = Column(String(500))
    bio = Column(Text)
    
    # Location Sharing
    last_known_latitude = Column(String(20))
    last_known_longitude = Column(String(20))
    location_shared_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True))
    
    # Relationships
    emergency_contacts = relationship("EmergencyContact", back_populates="user", cascade="all, delete-orphan")
    verification_documents = relationship("VerificationDocument", back_populates="user", cascade="all, delete-orphan")
    sent_alerts = relationship("SafetyAlert", foreign_keys="SafetyAlert.sender_id", back_populates="sender")
    received_alerts = relationship("SafetyAlert", foreign_keys="SafetyAlert.recipient_id", back_populates="recipient")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', status='{self.status.value}')>"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_verified(self):
        return self.email_verified and self.phone_verified
    
    @property
    def is_fully_verified(self):
        return self.is_verified and self.id_verified