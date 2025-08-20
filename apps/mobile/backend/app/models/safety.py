"""
Safety models for SafeMeet application
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.utils.database import Base


class SafetyCheckIn(Base):
    """Model for user safety check-ins"""
    __tablename__ = "safety_check_ins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    note = Column(Text, nullable=True)
    expected_return = Column(DateTime, nullable=True)
    actual_return = Column(DateTime, nullable=True)
    is_safe = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="safety_check_ins")


class EmergencyAlert(Base):
    """Model for emergency alerts"""
    __tablename__ = "emergency_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    alert_type = Column(String(50), nullable=False)  # 'panic', 'check_in_overdue', 'manual'
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    message = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="emergency_alerts")


class SafetyContact(Base):
    """Model for user's emergency contacts"""
    __tablename__ = "safety_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_name = Column(String(100), nullable=False)
    contact_phone = Column(String(20), nullable=False)
    contact_email = Column(String(100), nullable=True)
    relationship_type = Column(String(50), nullable=False)  # 'family', 'friend', 'colleague'
    is_primary = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="safety_contacts")


class SafetyReport(Base):
    """Model for safety reports about locations or incidents"""
    __tablename__ = "safety_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String(50), nullable=False)  # 'incident', 'safe_area', 'unsafe_area'
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default='medium')  # 'low', 'medium', 'high', 'critical'
    is_verified = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="safety_reports")
