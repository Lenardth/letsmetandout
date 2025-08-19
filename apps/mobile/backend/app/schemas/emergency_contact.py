from pydantic import BaseModel
from typing import Optional

class EmergencyContactBase(BaseModel):
    name: str
    relation: str
    phone: str
    is_primary: Optional[bool] = False

class EmergencyContactCreate(EmergencyContactBase):
    pass

class EmergencyContactResponse(EmergencyContactBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True
