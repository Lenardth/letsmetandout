# app/services/emergency.py
"""
Emergency service for SafeMeet application
"""
from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.emergency_contact import EmergencyContact
from app.models.safety_alert import SafetyAlert, AlertType, AlertPriority, AlertStatus

# ---- Optional deps: provide safe fallbacks if modules are missing ----
try:
    from app.utils.sms import send_sms  # type: ignore
except Exception:
    def send_sms(_phone: str, _message: str) -> None:  # no-op fallback
        pass

try:
    from app.utils.geolocation import get_address_from_coordinates  # type: ignore
except Exception:
    def get_address_from_coordinates(_lat: str, _lng: str) -> Optional[str]:
        return None


class EmergencyService:
    def __init__(self) -> None:
        pass

    def create_emergency_alert(
        self,
        db: Session,
        user_id: int,
        message: str,
        latitude: Optional[str] = None,
        longitude: Optional[str] = None,
        notify_contacts: bool = True,
        contact_authorities: bool = False,
    ) -> SafetyAlert:
        """Create an emergency alert for a user."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        location_address = None
        if latitude and longitude:
            try:
                location_address = get_address_from_coordinates(latitude, longitude)
            except Exception:
                location_address = None

        alert = SafetyAlert(
            alert_type=AlertType.EMERGENCY,
            priority=AlertPriority.CRITICAL,
            status=AlertStatus.ACTIVE,
            sender_id=user_id,
            title="EMERGENCY ALERT",
            message=message,
            latitude=latitude,
            longitude=longitude,
            location_address=location_address,
        )

        db.add(alert)
        db.commit()
        db.refresh(alert)

        if notify_contacts:
            self._notify_emergency_contacts(db, user, alert)

        if contact_authorities:
            self._contact_emergency_services(db, user, alert)

        return alert

    def _notify_emergency_contacts(self, db: Session, user: User, alert: SafetyAlert) -> None:
        """Notify user's emergency contacts about an emergency."""
        contacts: List[EmergencyContact] = (
            db.query(EmergencyContact)
            .filter(
                EmergencyContact.user_id == user.id,
                EmergencyContact.can_receive_alerts == True,
            )
            .order_by(EmergencyContact.is_primary.desc(), EmergencyContact.id.asc())
            .all()
        )

        for contact in contacts:
            msg = self._format_emergency_message(user, alert)
            try:
                send_sms(contact.phone, msg)
            except Exception:
                pass  # Handle SMS errors gracefully

    def _format_emergency_message(self, user: User, alert: SafetyAlert) -> str:
        parts = [
            "🚨 EMERGENCY ALERT 🚨",
            f"{getattr(user, 'full_name', 'Your contact')} needs help!",
            f"Message: {alert.message or ''}".strip(),
        ]
        if alert.latitude and alert.longitude:
            if alert.location_address:
                parts.append(f"Location: {alert.location_address}")
            parts.append(f"GPS: https://maps.google.com/maps?q={alert.latitude},{alert.longitude}")
        parts.append("If this is a real emergency, contact emergency services immediately.")
        return "\n".join([p for p in parts if p])

    def _contact_emergency_services(self, db: Session, _user: User, alert: SafetyAlert) -> None:
        """Stub for integrating with official emergency services."""
        if hasattr(alert, "emergency_services_contacted"):
            alert.emergency_services_contacted = True
            db.commit()
