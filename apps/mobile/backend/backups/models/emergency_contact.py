# app/models/emergency_contact.py
"""
Emergency Contact model for SafeMeet application
"""
import sqlalchemy as sa
from sqlalchemy.orm import relationship as sa_relationship
from sqlalchemy.sql import func

from app.utils.database import Base
from enum import Enum as PyEnum


class ContactRelation(PyEnum):
    PARENT = "parent"
    SIBLING = "sibling"
    SPOUSE = "spouse"
    FRIEND = "friend"
    PARTNER = "partner"
    GUARDIAN = "guardian"
    COLLEAGUE = "colleague"
    OTHER = "other"


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = sa.Column(sa.Integer, primary_key=True, index=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False)

    # Contact info
    name = sa.Column(sa.String(200), nullable=False)
    phone = sa.Column(sa.String(20), nullable=False)
    email = sa.Column(sa.String(255))
    relation = sa.Column(sa.Enum(ContactRelation), nullable=True)

    # Preferences / settings
    is_primary = sa.Column(sa.Boolean, default=False, nullable=False)
    can_receive_alerts = sa.Column(sa.Boolean, default=True, nullable=False)
    can_receive_check_ins = sa.Column(sa.Boolean, default=True, nullable=False)
    can_receive_location_shares = sa.Column(sa.Boolean, default=False, nullable=False)

    # Priority & status
    priority = sa.Column(sa.Integer, default=1)
    is_active = sa.Column(sa.Boolean, default=True, nullable=False)
    verified = sa.Column(sa.Boolean, default=False)

    # Timestamps
    created_at = sa.Column(sa.DateTime(timezone=True), server_default=func.now())
    updated_at = sa.Column(sa.DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = sa_relationship("User", back_populates="emergency_contacts", lazy="joined")
    safety_alerts = sa_relationship(
        "SafetyAlert",
        back_populates="contact",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def __repr__(self):
        rel = self.relation.value if self.relation else None
        return (
            f"<EmergencyContact(id={self.id}, user_id={self.user_id}, "
            f"name='{self.name}', relation='{rel}', primary={self.is_primary})>"
        )
