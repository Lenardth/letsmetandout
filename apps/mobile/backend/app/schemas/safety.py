# app/schemas/safety.py
"""
Safety schemas for SafeMeet application
"""
from pydantic import BaseModel, validator, Field
from datetime import datetime, timedelta
from typing import Optional, List
from app.models.safety_alert import AlertStatus # Assuming AlertStatus is in this location


class SafetyPreferencesUpdate(BaseModel):
    location_sharing: Optional[bool] = None
    emergency_alerts: Optional[bool] = None
    group_verification: Optional[bool] = None
    background_check: Optional[bool] = None
    auto_check_in: Optional[bool] = None
    check_in_interval_minutes: Optional[int] = None
    late_return_threshold_minutes: Optional[int] = None

    @validator('check_in_interval_minutes')
    def validate_check_in_interval(cls, v):
        if v is not None and (v < 5 or v > 480):  # 5 minutes to 8 hours
            raise ValueError('Check-in interval must be between 5 and 480 minutes')
        return v

    @validator('late_return_threshold_minutes')
    def validate_late_return_threshold(cls, v):
        if v is not None and (v < 5 or v > 120):  # 5 minutes to 2 hours
            raise ValueError('Late return threshold must be between 5 and 120 minutes')
        return v

class SafetyCheckInCreate(BaseModel):
    message: Optional[str] = None
    latitude: float
    longitude: float
    expected_return_time: Optional[datetime] = Field(default_factory=lambda: datetime.utcnow() + timedelta(hours=1))

    @validator('latitude')
    def validate_latitude(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90')
        return v

    @validator('longitude')
    def validate_longitude(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180')
        return v

class LocationShareRequest(BaseModel):
    latitude: float
    longitude: float
    duration_minutes: int = 60
    message: Optional[str] = "Sharing my location with you for safety."
    share_with_contacts: bool = True

    @validator('duration_minutes')
    def validate_duration(cls, v):
        if v < 5 or v > 480: # 5 minutes to 8 hours
            raise ValueError("Duration must be between 5 and 480 minutes.")
        return v

class EmergencyAlertCreate(BaseModel):
    message: str
    latitude: float
    longitude: float
    notify_emergency_contacts: bool = True
    contact_emergency_services: bool = False

class SafetyAlertUpdate(BaseModel):
    status: AlertStatus
    response_notes: Optional[str] = None
    police_notified: Optional[bool] = None
    police_case_number: Optional[str] = None
    emergency_services_contacted: Optional[bool] = None

class NotifyEmergencyContactRequest(BaseModel):
    contact_ids: List[int]
    message: str = "This is an emergency alert. Please check on me."

class EmergencyAlertResponse(BaseModel):
    id: int
    sender_id: int
    status: str
    message: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EmergencyContactCreate(BaseModel):
    contact_name: str
    contact_phone: str
    contact_email: Optional[str] = None
    relationship_type: str
    is_primary: bool = False

    @validator('contact_phone')
    def validate_phone(cls, v):
        if not v.replace('+', '').replace(' ', '').replace('-', '').isdigit():
            raise ValueError('Phone number must contain only digits, spaces, dashes, and plus sign')
        return v

    @validator('relationship_type')
    def validate_relationship_type(cls, v):
        valid_types = ['family', 'friend', 'colleague', 'partner', 'other']
        if v.lower() not in valid_types:
            raise ValueError(f'Relationship type must be one of: {", ".join(valid_types)}')
        return v.lower()

class EmergencyContactResponse(BaseModel):
    id: int
    user_id: int
    contact_name: str
    contact_phone: str
    contact_email: Optional[str]
    relationship_type: str
    is_primary: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
