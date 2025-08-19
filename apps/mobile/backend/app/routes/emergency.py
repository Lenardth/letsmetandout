from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.utils.security import get_current_user
from app.schemas.emergency_contact import EmergencyContactCreate, EmergencyContactResponse
from app.schemas.safety import SafetyAlertCreate, SafetyAlertResponse
from app.services.emergency import (
    create_emergency_contact,
    get_user_emergency_contacts,
    delete_emergency_contact,
    send_emergency_alerts
)
from app.models.user import User

router = APIRouter()

@router.get("/contacts", response_model=list[EmergencyContactResponse])
def get_emergency_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_emergency_contacts(db, current_user.id)

@router.post("/contacts", response_model=EmergencyContactResponse)
def add_emergency_contact(
    contact: EmergencyContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_emergency_contact(db, current_user.id, contact)

@router.delete("/contacts/{contact_id}")
def remove_emergency_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = delete_emergency_contact(db, contact_id, current_user.id)
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency contact not found"
        )
    return {"message": "Emergency contact deleted successfully"}

@router.post("/alert", response_model=SafetyAlertResponse)
def send_emergency_alert(
    alert: SafetyAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return send_emergency_alerts(db, current_user.id, alert)
