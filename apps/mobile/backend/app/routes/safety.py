from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.utils.security import get_current_user
from app.schemas.safety import SafetySettings
from app.models.user import User

router = APIRouter()

@router.get("/settings", response_model=SafetySettings)
def get_safety_settings(current_user: User = Depends(get_current_user)):
    return current_user.safety_settings

@router.put("/settings", response_model=SafetySettings)
def update_safety_settings(
    settings: SafetySettings,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.safety_settings = settings.dict()
    db.commit()
    db.refresh(current_user)
    return current_user.safety_settings
