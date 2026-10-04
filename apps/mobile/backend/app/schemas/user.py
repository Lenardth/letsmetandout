"""
User schemas for SafeMeet application
"""
from typing import List, Optional, Dict, Any, Annotated, Literal
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
    first_name: str = Field(min_length=1, max_length=100, pattern=r"\S")
    last_name: str = Field(min_length=1, max_length=100, pattern=r"\S")
    phone: str = Field(pattern=r"^\+27[6-8]\d{8}$")
    city: str = Field(min_length=1, max_length=100, pattern=r"\S")
    province: Literal["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"]
    password: str = Field(min_length=8, max_length=72, pattern=r"^[\x20-\x7E]+$")
    terms_accepted: Literal[True]
    privacy_accepted: Literal[True]
    safety_guidelines_accepted: Literal[True]


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=100, pattern=r"\S")
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=100, pattern=r"\S")
    phone: Optional[str] = Field(default=None, pattern=r"^\+27[6-8]\d{8}$")
    address: Optional[str] = None
    city: Optional[str] = Field(default=None, min_length=1, max_length=100, pattern=r"\S")
    province: Optional[Literal["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"]] = None
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
