"""
User schemas for SafeMeet application
"""
from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserStatus, VerificationLevel


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    safety_preferences: Dict[str, Any] = Field(default_factory=dict)
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str
    id_number: str
    terms_accepted: bool = True
    privacy_accepted: bool = True
    safety_guidelines_accepted: bool = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    interests: Optional[List[str]] = None
    safety_preferences: Optional[Dict[str, Any]] = None
    bio: Optional[str] = None


class UserResponse(UserBase):
    id: int
    status: UserStatus
    verification_level: VerificationLevel
    email_verified: bool
    phone_verified: bool
    id_verified: bool
    background_check_passed: bool
    profile_photo_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserPublicProfile(BaseModel):
    id: int
    first_name: str
    last_name: str
    profile_photo_url: Optional[str] = None
    bio: Optional[str] = None
    interests: List[str]
    verification_level: VerificationLevel
    city: Optional[str] = None
    province: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Use regex via `pattern` instead of `regex` (Pydantic v2)
DecimalDegreeStr = Annotated[
    str,
    Field(
        pattern=r"^-?\d{1,3}\.\d{1,10}$",
        description="Decimal degrees as string, e.g., 12.345678 or -73.9855",
    ),
]


class UpdateLocationRequest(BaseModel):
    latitude: DecimalDegreeStr
    longitude: DecimalDegreeStr


class LocationResponse(BaseModel):
    latitude: Optional[str]
    longitude: Optional[str]
    location_shared_at: Optional[datetime]

    class Config:
        from_attributes = True
