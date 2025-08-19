from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List, Dict

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    username: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    safety_settings: Optional[Dict] = None

class UserResponse(UserBase):
    id: int
    join_date: datetime
    rating: float
    total_meetups: int
    groups_joined: int
    safety_score: int
    is_verified: bool
    is_active: bool
    safety_settings: Dict
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
