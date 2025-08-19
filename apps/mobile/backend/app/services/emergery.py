from sqlalchemy.orm import Session
from app.models.emergency_contact import EmergencyContact
from app.models.safety_alert import SafetyAlert
from app.schemas.emergency_contact import EmergencyContactCreate
from app.schemas.safety import SafetyAlertCreate
from app.utils.sms import send_sms
from app.utils.geolocation import get_address_from_coordinates

def create_emergency_contact(db: Session, user_id: int, contact: EmergencyContactCreate):
    db_contact = EmergencyContact(**contact.dict(), user_id=user_id)
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def get_user_emergency_contacts(db: Session, user_id: int):
    return db.query(EmergencyContact).filter(EmergencyContact.user_id == user_id).all()

def delete_emergency_contact(db: Session, contact_id: int, user_id: int):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.user_id == user_id
    ).first()
    if contact:
        db.delete(contact)
        db.commit()
    return contact

def create_safety_alert(db: Session, user_id: int, alert: SafetyAlertCreate):
    location_address = None
    if alert.latitude and alert.longitude:
        location_address = get_address_from_coordinates(alert.latitude, alert.longitude)
    
    db_alert = SafetyAlert(
        **alert.dict(),
        user_id=user_id,
        location_address=location_address
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def send_emergency_alerts(db: Session, user_id: int, alert: SafetyAlertCreate):
    # Create the alert
    db_alert = create_safety_alert(db, user_id, alert)
    
    # Get emergency contacts
    contacts = get_user_emergency_contacts(db, user_id)
    
    # Send alerts to contacts
    for contact in contacts:
        message = f"EMERGENCY ALERT: {db_alert.message or 'User needs help!'}"
        if db_alert.location_address:
            message += f" Location: {db_alert.location_address}"
        
        send_sms(contact.phone, message)
    
    return db_alert
