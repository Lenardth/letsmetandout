# app/models/safety_alert.py
"""
Safety Alert models for SafeMeet application
"""
import sqlalchemy as sa
from sqlalchemy.orm import relationship as sa_relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum

from app.utils.database import Base


class AlertType(PyEnum):
    EMERGENCY = "emergency"            # Immediate danger
    CHECK_IN = "check_in"              # Scheduled safety check-in
    LATE_RETURN = "late_return"        # User is late returning from meetup
    SUSPICIOUS_ACTIVITY = "suspicious_activity"  # Report suspicious behavior
    LOCATION_SHARE = "location_share"  # Share current location
    SAFE_ARRIVAL = "safe_arrival"      # Confirm safe arrival at destination


class AlertStatus(PyEnum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    FALSE_ALARM = "false_alarm"


class AlertPriority(PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SafetyAlert(Base):
    __tablename__ = "safety_alerts"

    id = sa.Column(sa.Integer, primary_key=True, index=True)

    # Foreign keys
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False, index=True)
    contact_id = sa.Column(
        sa.Integer,
        sa.ForeignKey("emergency_contacts.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Core fields
    type = sa.Column(sa.Enum(AlertType), nullable=False)
    status = sa.Column(sa.Enum(AlertStatus), nullable=False, default=AlertStatus.ACTIVE)
    priority = sa.Column(sa.Enum(AlertPriority), nullable=False, default=AlertPriority.MEDIUM)

    message = sa.Column(sa.Text)                # Free-text message
    location_text = sa.Column(sa.String(255))   # Human-readable location (optional)
    latitude = sa.Column(sa.Float)              # Optional geo
    longitude = sa.Column(sa.Float)             # Optional geo

    # Timestamps
    created_at = sa.Column(sa.DateTime(timezone=True), server_default=func.now())
    updated_at = sa.Column(sa.DateTime(timezone=True), onupdate=func.now())
    resolved_at = sa.Column(sa.DateTime(timezone=True))

    # Relationships
    user = sa_relationship("User", back_populates="safety_alerts", lazy="joined")
    contact = sa_relationship("EmergencyContact", back_populates="safety_alerts", lazy="joined")

    def __repr__(self):
        return (
            f"<SafetyAlert(id={self.id}, user_id={self.user_id}, "
            f"type={self.type.value}, status={self.status.value}, priority={self.priority.value})>"
        )
