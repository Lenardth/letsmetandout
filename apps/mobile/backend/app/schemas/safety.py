"""
SafeMeet Application Schemas
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
from app.models.safety_alert import AlertType, AlertStatus, AlertPriority

# Enums for new schemas
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SAFETY_RESPONDER = "safety_responder"

class MeetupStatus(str, Enum):
    SCHEDULED = "scheduled"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

# User-related schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    phone_number: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{1,14}$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.USER

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    phone_number: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{1,14}$")

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Meetup-related schemas
class MeetupBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    scheduled_start: datetime
    scheduled_end: datetime
    location_name: Optional[str] = Field(None, max_length=255)
    location_address: Optional[str] = Field(None, max_length=500)
    latitude: Optional[str] = None
    longitude: Optional[str] = None

class MeetupCreate(MeetupBase):
    participant_ids: List[int] = []

class MeetupUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    status: Optional[MeetupStatus] = None
    location_name: Optional[str] = Field(None, max_length=255)
    location_address: Optional[str] = Field(None, max_length=500)
    latitude: Optional[str] = None
    longitude: Optional[str] = None

class MeetupResponse(MeetupBase):
    id: int
    creator_id: int
    status: MeetupStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    participants: List[UserResponse] = []

    class Config:
        from_attributes = True

# Safety Contact schemas
class SafetyContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$")
    relationship: str = Field(..., max_length=50)

class SafetyContactCreate(SafetyContactBase):
    pass

class SafetyContactResponse(SafetyContactBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Verification schemas
class VerificationRequest(BaseModel):
    document_type: str = Field(..., max_length=50)
    document_number: str = Field(..., max_length=100)
    document_image_url: str = Field(..., max_length=500)

class VerificationResponse(BaseModel):
    id: int
    user_id: int
    status: VerificationStatus
    submitted_at: datetime
    processed_at: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=1000)

    class Config:
        from_attributes = True

# Extended Safety Preferences Response
class SafetyPreferencesResponse(BaseModel):
    user_id: int
    location_sharing: bool
    emergency_alerts: bool
    group_verification: bool
    background_check: bool
    auto_check_in: bool
    check_in_interval_minutes: Optional[int] = Field(None, ge=15, le=180)
    late_return_threshold_minutes: Optional[int] = Field(None, ge=15, le=240)
    updated_at: datetime

    class Config:
        from_attributes = True

# Notification schemas
class NotificationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., max_length=1000)
    is_read: bool = False

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True