"""
Safety schemas for SafeMeet application
"""
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List


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
    latitude: float
    longitude: float
    note: Optional[str] = None
    expected_return: Optional[datetime] = None

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


class SafetyCheckInResponse(BaseModel):
    id: int
    user_id: int
    latitude: float
    longitude: float
    note: Optional[str]
    expected_return: Optional[datetime]
    actual_return: Optional[datetime]
    is_safe: bool
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
        # Basic South African phone number validation
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


class SafetyReportCreate(BaseModel):
    report_type: str
    latitude: float
    longitude: float
    title: str
    description: str
    severity: str = 'medium'
    is_public: bool = True

    @validator('report_type')
    def validate_report_type(cls, v):
        valid_types = ['incident', 'safe_area', 'unsafe_area']
        if v.lower() not in valid_types:
            raise ValueError(f'Report type must be one of: {", ".join(valid_types)}')
        return v.lower()

    @validator('severity')
    def validate_severity(cls, v):
        valid_severities = ['low', 'medium', 'high', 'critical']
        if v.lower() not in valid_severities:
            raise ValueError(f'Severity must be one of: {", ".join(valid_severities)}')
        return v.lower()

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


class SafetyReportResponse(BaseModel):
    id: int
    user_id: int
    report_type: str
    latitude: float
    longitude: float
    title: str
    description: str
    severity: str
    is_verified: bool
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmergencyAlertCreate(BaseModel):
    alert_type: str
    latitude: float
    longitude: float
    message: Optional[str] = None

    @validator('alert_type')
    def validate_alert_type(cls, v):
        valid_types = ['panic', 'check_in_overdue', 'manual']
        if v.lower() not in valid_types:
            raise ValueError(f'Alert type must be one of: {", ".join(valid_types)}')
        return v.lower()


class EmergencyAlertResponse(BaseModel):
    id: int
    user_id: int
    alert_type: str
    latitude: float
    longitude: float
    message: Optional[str]
    is_resolved: bool
    resolved_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
