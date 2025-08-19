"""
Security utilities for SafeMeet application
"""
from typing import Optional
from datetime import datetime, timedelta, timezone
import hashlib
import secrets
import re

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.utils.database import get_db
from app.models.user import User
from app.config import settings  # expects SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES (optional)

security = HTTPBearer()

# ---------------------------
# Password hashing (bcrypt)
# ---------------------------
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return _pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its hashed version."""
    return _pwd_context.verify(plain_password, hashed_password)

# ---------------------------
# JWT helpers (no AuthService import)
# ---------------------------
def create_access_token(data: dict, expires_minutes: Optional[int] = None) -> str:
    """
    Create a signed JWT access token.
    `data` should include a subject, e.g. {"sub": str(user.id)}
    """
    to_encode = data.copy()
    expire = datetime.now(tz=timezone.utc) + timedelta(
        minutes=expires_minutes or getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str) -> dict:
    """Decode and validate a JWT access token; raises 401 on failure."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

# ---------------------------
# FastAPI dependencies
# ---------------------------
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Get current authenticated user from Bearer token."""
    payload = verify_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure user is not suspended or deactivated."""
    from app.models.user import UserStatus
    if current_user.status in (UserStatus.SUSPENDED, UserStatus.DEACTIVATED):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or deactivated",
        )
    return current_user

async def get_current_verified_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Ensure user has completed required verifications."""
    if not getattr(current_user, "is_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email and phone verification required",
        )
    return current_user

# ---------------------------
# Misc security utilities
# ---------------------------
def hash_sensitive_data(data: str) -> str:
    """Hash sensitive data for storage (non-password fields)."""
    return hashlib.sha256(data.encode()).hexdigest()

def generate_secure_token() -> str:
    """Generate a secure random token."""
    return secrets.token_urlsafe(32)

def validate_sa_id_number(id_number: str) -> bool:
    """
    Validate South African ID number with basic checks and a Luhn-like checksum.
    """
    if not id_number or len(id_number) != 13 or not id_number.isdigit():
        return False

    dob = id_number[:6]
    gender = int(id_number[6:10])     # 0000–4999 female, 5000–9999 male (not strictly enforced here)
    citizenship = int(id_number[10])  # 0 SA citizen, 1 permanent resident
    check_digit = int(id_number[12])

    yy = int(dob[:2])
    mm = int(dob[2:4])
    dd = int(dob[4:6])
    if not (1 <= mm <= 12 and 1 <= dd <= 31):
        return False
    if citizenship not in (0, 1):
        return False

    digits = [int(d) for d in id_number[:-1]]
    # starting from the right, double every second digit
    for i in range(len(digits) - 1, -1, -2):
        doubled = digits[i] * 2
        digits[i] = doubled if doubled < 10 else (doubled // 10 + doubled % 10)

    total = sum(digits)
    calc = (10 - (total % 10)) % 10
    return calc == check_digit

def validate_sa_phone_number(phone: str) -> bool:
    """Validate SA phone number format: +27 followed by 9 digits."""
    clean = re.sub(r"[^\d+]", "", phone)
    return bool(re.match(r"^\+27\d{9}$", clean))

def sanitize_input(input_string: str) -> str:
    """Sanitize user input to mitigate injection vectors."""
    if not input_string:
        return ""
    dangerous = ['<', '>', '"', "'", '&', '\x00']
    sanitized = input_string
    for ch in dangerous:
        sanitized = sanitized.replace(ch, '')
    return sanitized[:1000].strip()

def rate_limit_key(user_id: int, action: str) -> str:
    """Generate a namespaced rate-limit key."""
    return f"rate_limit:{user_id}:{action}"

class PermissionChecker:
    """Check user permissions for various actions."""
    @staticmethod
    def can_upload_documents(user: User) -> bool:
        from app.models.user import UserStatus
        return user.status in (UserStatus.PENDING_VERIFICATION, UserStatus.ACTIVE)

    @staticmethod
    def can_create_emergency_alert(user: User) -> bool:
        return bool(getattr(user, "phone_verified", False))

    @staticmethod
    def can_access_location_features(user: User) -> bool:
        return bool(getattr(user, "is_verified", False))

    @staticmethod
    def can_join_premium_groups(user: User) -> bool:
        from app.models.user import VerificationLevel
        return user.verification_level in (VerificationLevel.STANDARD, VerificationLevel.PREMIUM)

    @staticmethod
    def can_host_events(user: User) -> bool:
        return bool(getattr(user, "is_fully_verified", False))
