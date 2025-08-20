# app/models/emergency_contact.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.utils.database import Base


class ContactRelation(str, enum.Enum):
    FAMILY = "family"
    FRIEND = "friend"
    COLLEAGUE = "colleague"
    PARTNER = "partner"
    OTHER = "other"


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=True)
    relation = Column(Enum(ContactRelation), nullable=False)

    priority = Column(Integer, default=1)
    notify_on_emergency = Column(Boolean, default=True)
    notify_on_check_in = Column(Boolean, default=False)
    notify_on_late_return = Column(Boolean, default=True)

    is_active = Column(Boolean, default=True)
    verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to user
    user = relationship("User", back_populates="emergency_contacts")