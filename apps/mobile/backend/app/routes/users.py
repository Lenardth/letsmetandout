from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.utils.database import get_db
from app.schemas.user import UserResponse, UserUpdate, UserPublicProfile
from app.services.auth import get_user_by_email
from app.utils.security import get_current_active_user
from app.models.user import User, UserStatus

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    update_data = user_update.model_dump(exclude_unset=True)
    if any(update_data.get(key) is None for key in ["first_name", "last_name", "city", "province", "phone"] if key in update_data):
        raise HTTPException(status_code=422, detail="Required profile fields cannot be cleared")
    
    if "email" in update_data and update_data["email"] != current_user.email:
        existing_user = get_user_by_email(db, update_data["email"])
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Phone already registered")
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=UserPublicProfile)
def get_user_profile(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    user = db.query(User).filter(User.id == user_id, User.status.notin_([UserStatus.SUSPENDED, UserStatus.DEACTIVATED])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
