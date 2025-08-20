"""
User schemas for SafeMeet application
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum


class UserStatus(str, Enum):
    PENDING_VERIFICATION = "pending_verification"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DEACTIVATED = "deactivated"


class VerificationLevel(str, Enum):
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"


class UserBase(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^\+27[0-9]{9}$')
    address: str = Field(..., min_length=5)
    city: str = Field(..., min_length=2, max_length=100)
    province: str = Field(..., max_length=100)
    id_number: str = Field(..., pattern=r'^[0-9]{13}$')
    interests: List[str] = Field(..., min_items=1)
    safety_preferences: Dict[str, Any] = Field(default_factory=dict)
    terms_accepted: Literal[True] = Field(...)
    privacy_accepted: Literal[True] = Field(...)
    safety_guidelines_accepted: Literal[True] = Field(...)

    @validator('province')
    def validate_province(cls, v):
        valid_provinces = [
            "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
            "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
        ]
        if v not in valid_provinces:
            raise ValueError('Invalid South African province')
        return v

    class Config:
        str_strip_whitespace = True
        from_attributes = True  # Replaces orm_mode in Pydantic v2


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = Field(None, min_length=5)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    province: Optional[str] = Field(None, max_length=100)
    interests: Optional[List[str]] = Field(None, min_items=1)
    safety_preferences: Optional[Dict[str, Any]] = Field(None)
    profile_photo_url: Optional[str] = Field(None)
    bio: Optional[str] = Field(None)

    @validator('province')
    def validate_province(cls, v):
        if v is None:
            return v
            
        valid_provinces = [
            "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
            "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
        ]
        if v not in valid_provinces:
            raise ValueError('Invalid South African province')
        return v

    class Config:
        str_strip_whitespace = True
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    status: UserStatus
    verification_level: VerificationLevel
    email_verified: bool
    phone_verified: bool
    id_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True  # Replaces orm_mode in Pydantic v2