# app/services/auth.py
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)

# ---------- Queries ----------

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Only works if your User model has a `username` column."""
    if hasattr(User, "username"):
        return db.query(User).filter(User.username == username).first()
    return None

# ---------- Create/Register ----------

def create_user(db: Session, payload: UserCreate) -> User:
    # Unique by email
    if get_user_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Optional unique by username
    username = getattr(payload, "username", None)
    if username and hasattr(User, "username") and get_user_by_username(db, username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    hashed_password = get_password_hash(payload.password)

    # Build kwargs only for columns that exist on your model
    user_kwargs = dict(
        email=payload.email,
        first_name=getattr(payload, "first_name", None),
        last_name=getattr(payload, "last_name", None),
        phone=getattr(payload, "phone", None),
        address=getattr(payload, "address", None),
        city=getattr(payload, "city", None),
        province=getattr(payload, "province", None),
        bio=getattr(payload, "bio", None),
        password_hash=hashed_password,
    )
    if hasattr(User, "username"):
        user_kwargs["username"] = username
    if hasattr(User, "avatar_url"):
        user_kwargs["avatar_url"] = getattr(payload, "avatar_url", None)
    if hasattr(User, "location"):
        user_kwargs["location"] = getattr(payload, "location", None)

    # If your model stores interests in a text column; adjust if JSON
    interests = getattr(payload, "interests", None)
    if interests is not None and hasattr(User, "interests"):
        user_kwargs["interests"] = ",".join(interests) if isinstance(interests, list) else str(interests)

    # Policy flags if present
    for flag in ("terms_accepted", "privacy_accepted", "safety_guidelines_accepted"):
        if hasattr(User, flag):
            user_kwargs[flag] = bool(getattr(payload, flag, True))

    user = User(**user_kwargs)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# ---------- Authentication / Tokens ----------

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def login_and_issue_token(db: Session, email: str, password: str) -> Tuple[str, User]:
    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token({"sub": str(user.id)})
    return token, user
