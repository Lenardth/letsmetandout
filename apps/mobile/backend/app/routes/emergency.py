# app/routes/emergency.py
"""
Emergency routes for SafeMeet application
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.utils.database import get_db
from app.utils.security import get_current_verified_user, PermissionChecker
from app.services.emergency import EmergencyService
from app.schemas.safety import (
    EmergencyAlertRequest, CheckInRequest, LocationShareRequest,
    SafetyAlertResponse, SafetyAlertUpdate
)
from app.schemas.emergency_contact import NotifyEmergencyContactRequest
from app.models.user import User
from app.models.safety_alert import SafetyAlert, AlertStatus

router = APIRouter(prefix="/emergency", tags=["Emergency"])
emergency_service = EmergencyService()


@router.post("/alert", response_model=dict)
async def create_emergency_alert(
    alert_data: EmergencyAlertRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Create an emergency alert"""
    if not PermissionChecker.can_create_emergency_alert(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Phone verification required for emergency features"
        )

    try:
        alert = emergency_service.create_emergency_alert(
            db=db,
            user_id=current_user.id,
            message=alert_data.message,
            latitude=alert_data.latitude,
            longitude=alert_data.longitude,
            notify_contacts=alert_data.notify_emergency_contacts,
            contact_authorities=alert_data.contact_emergency_services,
        )

        return {
            "message": "Emergency alert created successfully",
            "alert_id": alert.id,
            "status": alert.status.value,
            "created_at": alert.created_at,
            "emergency_contacts_notified": alert_data.notify_emergency_contacts,
            "emergency_services_contacted": alert.emergency_services_contacted,
            "next_steps": [
                "Emergency contacts have been notified via SMS",
                "Stay calm and wait for help",
                "Contact local emergency services (10111) if immediate danger",
                "Update alert status when safe",
            ],
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create emergency alert",
        )


@router.post("/check-in", response_model=dict)
async def create_check_in(
    checkin_data: CheckInRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Create a safety check-in"""
    try:
        alert = emergency_service.create_check_in(
            db=db,
            user_id=current_user.id,
            message=checkin_data.message,
            latitude=checkin_data.latitude,
            longitude=checkin_data.longitude,
            expected_return=checkin_data.expected_return_time,
        )

        return {
            "message": "Safety check-in recorded successfully",
            "alert_id": alert.id,
            "status": alert.status.value,
            "created_at": alert.created_at,
            "location_shared": bool(alert.latitude and alert.longitude),
            "expected_return": alert.expected_return_time,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create check-in",
        )


@router.post("/share-location", response_model=dict)
async def share_location(
    location_data: LocationShareRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Share current location with emergency contacts"""
    if not PermissionChecker.can_access_location_features(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Full verification required for location sharing",
        )

    try:
        alert = emergency_service.share_location(
            db=db,
            user_id=current_user.id,
            latitude=location_data.latitude,
            longitude=location_data.longitude,
            duration_minutes=location_data.duration_minutes,
            message=location_data.message,
        )

        return {
            "message": "Location shared successfully",
            "alert_id": alert.id,
            "shared_until": alert.expected_return_time,
            "duration_minutes": location_data.duration_minutes,
            "contacts_notified": location_data.share_with_contacts,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share location",
        )


@router.get("/alerts", response_model=List[SafetyAlertResponse])
async def get_user_alerts(
    status_filter: Optional[AlertStatus] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Get user's safety alerts history"""
    query = db.query(SafetyAlert).filter(SafetyAlert.sender_id == current_user.id)

    if status_filter:
        query = query.filter(SafetyAlert.status == status_filter)

    alerts = query.order_by(SafetyAlert.created_at.desc()).limit(limit).all()
    return alerts


@router.get("/alerts/{alert_id}", response_model=SafetyAlertResponse)
async def get_alert_details(
    alert_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Get specific alert details"""
    alert = (
        db.query(SafetyAlert)
        .filter(SafetyAlert.id == alert_id, SafetyAlert.sender_id == current_user.id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found"
        )

    return alert


@router.put("/alerts/{alert_id}", response_model=SafetyAlertResponse)
async def update_alert_status(
    alert_id: int,
    update_data: SafetyAlertUpdate,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Update alert status (acknowledge/resolve)"""
    alert = (
        db.query(SafetyAlert)
        .filter(SafetyAlert.id == alert_id, SafetyAlert.sender_id == current_user.id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found"
        )

    if update_data.status == AlertStatus.ACKNOWLEDGED:
        alert = emergency_service.acknowledge_alert(db, alert_id, current_user.id)
    elif update_data.status == AlertStatus.RESOLVED:
        alert = emergency_service.resolve_alert(
            db, alert_id, current_user.id, update_data.response_notes
        )

    if update_data.police_notified is not None:
        alert.police_notified = update_data.police_notified
    if update_data.police_case_number:
        alert.police_case_number = update_data.police_case_number
    if update_data.emergency_services_contacted is not None:
        alert.emergency_services_contacted = update_data.emergency_services_contacted

    db.commit()
    db.refresh(alert)
    return alert


@router.post("/notify-contacts")
async def notify_emergency_contacts(
    notify_data: NotifyEmergencyContactRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Manually notify specific emergency contacts"""
    from app.models.emergency_contact import EmergencyContact

    contacts = (
        db.query(EmergencyContact)
        .filter(
            EmergencyContact.id.in_(notify_data.contact_ids),
            EmergencyContact.user_id == current_user.id,
            EmergencyContact.is_active == True,
        )
        .all()
    )

    if len(contacts) != len(notify_data.contact_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more contacts not found or inactive",
        )

    try:
        alert = emergency_service.create_emergency_alert(
            db=db,
            user_id=current_user.id,
            message=notify_data.message,
            notify_contacts=True,
            contact_authorities=False,
        )

        return {
            "message": f"Notification sent to {len(contacts)} emergency contacts",
            "alert_id": alert.id,
            "contacts_notified": len(contacts),
            "created_at": alert.created_at,
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send notifications",
        )


@router.get("/quick-actions")
async def get_quick_actions(current_user: User = Depends(get_current_verified_user)):
    """Get available emergency quick actions based on user's verification level"""
    actions = []

    actions.extend(
        [
            {
                "id": "check_in",
                "title": "Safety Check-in",
                "description": "Let your contacts know you're safe",
                "icon": "✅",
                "color": "green",
                "requires": "phone_verified",
            },
            {
                "id": "share_location",
                "title": "Share Location",
                "description": "Share your current location for a set time",
                "icon": "📍",
                "color": "blue",
                "requires": "verified",
            },
        ]
    )

    if PermissionChecker.can_create_emergency_alert(current_user):
        actions.extend(
            [
                {
                    "id": "emergency_alert",
                    "title": "Emergency Alert",
                    "description": "Send immediate emergency notification",
                    "icon": "🚨",
                    "color": "red",
                    "requires": "phone_verified",
                },
                {
                    "id": "silent_alert",
                    "title": "Silent Alert",
                    "description": "Send discrete emergency signal",
                    "icon": "🔕",
                    "color": "orange",
                    "requires": "phone_verified",
                },
            ]
        )

    if current_user.is_fully_verified:
        actions.append(
            {
                "id": "panic_button",
                "title": "Panic Button",
                "description": "Immediate emergency services contact",
                "icon": "🆘",
                "color": "red",
                "requires": "fully_verified",
            }
        )

    return {
        "actions": actions,
        "user_verification_level": current_user.verification_level.value,
        "can_use_emergency_features": PermissionChecker.can_create_emergency_alert(
            current_user
        ),
        "emergency_contacts_count": len(
            [c for c in current_user.emergency_contacts if c.is_active]
        ),
    }


@router.get("/emergency-info")
async def get_emergency_information():
    """Get South African emergency contact information"""
    return {
        "national_emergency_numbers": {
            "police": "10111",
            "ambulance": "10177",
            "fire": "10177",
            "general_emergency": "112",
        },
        "provincial_emergency_contacts": {
            "Western Cape": {"emergency": "107", "disaster": "021 480 7700"},
            "Gauteng": {"emergency": "10177", "disaster": "011 833 5501"},
            "KwaZulu-Natal": {"emergency": "10177", "disaster": "033 392 8888"},
        },
        "safety_tips": [
            "Save emergency numbers in your phone",
            "Keep your phone charged",
            "Share your location with trusted contacts",
            "Trust your instincts - if something feels wrong, leave",
            "Meet in public places",
            "Tell someone where you're going",
        ],
        "app_features": [
            "Emergency alert sends SMS to all your contacts",
            "Location sharing works for up to 8 hours",
            "Check-ins let contacts know you're safe",
            "All alerts are logged for your safety record",
        ],
    }
