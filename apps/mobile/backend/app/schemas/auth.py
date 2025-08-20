"""
Authentication schemas for SafeMeet application
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime


class SignupRequest(BaseModel):
    # Basic Information
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^\+27[0-9]{9}$')  # South African phone format
    password: str = Field(..., min_length=8)
    confirm_password: str
    
    # Location & Safety
    address: str = Field(..., min_length=5)
    city: str = Field(..., min_length=2, max_length=100)
    province: str = Field(..., max_length=100)
    emergency_contact_1: str = Field(..., pattern=r'^\+27[0-9]{9}$')
    emergency_relation_1: str = Field(..., min_length=2, max_length=50)
    emergency_contact_2: Optional[str] = Field(None, pattern=r'^\+27[0-9]{9}$')
    emergency_relation_2: Optional[str] = Field(None, max_length=50)
    
    # Verification
    id_number: str = Field(..., pattern=r'^[0-9]{13}$')  # SA ID number format
    
    # Preferences
    interests: List[str] = Field(..., min_items=1)
    safety_preferences: Dict[str, Any] = Field(default_factory=dict)
    
    # Agreements
    terms_accepted: Literal[True] = Field(...)
    privacy_accepted: Literal[True] = Field(...)
    safety_guidelines_accepted: Literal[True] = Field(...)
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
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


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    class Config:
        str_strip_whitespace = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr

    class Config:
        str_strip_whitespace = True


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    verification_code: str = Field(..., min_length=6, max_length=6)


class VerifyPhoneRequest(BaseModel):
    phone: str = Field(..., pattern=r'^\+27[0-9]{9}$')
    verification_code: str = Field(..., min_length=6, max_length=6)