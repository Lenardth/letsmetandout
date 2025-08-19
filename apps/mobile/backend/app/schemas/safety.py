from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SafetyAlertBase(BaseModel):
    alert_type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    message: Optional[str] = None

class SafetyAlertCreate(SafetyAlertBase):
    pass

class SafetyAlertResponse(SafetyAlertBase):
    id: int
    user_id: int
    location_address: Optional[str] = None
    is_active: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SafetySettings(BaseModel):
    location_sharing: bool
    safety_checkins: bool
    emergency_alerts: bool
    group_verification: bool
