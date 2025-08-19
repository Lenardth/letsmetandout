# app/routes/auth.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.utils.database import get_db
from app.utils.security import get_current_user, verify_token as verify_jwt
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import create_user, login_and_issue_token

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------- Schemas ----------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class VerifyTokenRequest(BaseModel):
    token: str

# ---------- Endpoints ----------

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user. Returns the created user (public-safe fields only).
    """
    user = create_user(db, payload)
    return user  # Pydantic model will shape it according to UserResponse

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email & password and receive a JWT bearer token.
    """
    token, user = login_and_issue_token(db, body.email, body.password)
    return TokenResponse(access_token=token)

@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    """
    Get the current authenticated user's profile using Bearer token.
    """
    return current_user

@router.post("/token/verify")
def verify_token(body: VerifyTokenRequest):
    """
    Verify a token and return its payload (debug/validation helper).
    """
    payload = verify_jwt(body.token)
    return {"valid": True, "payload": payload}
