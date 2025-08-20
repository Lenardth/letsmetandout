"""
Authentication service for SafeMeet application
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.utils.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# JWT settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def verify_password(plain_password, hashed_password):
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """Hash a password"""
    return pwd_context.hash(password)


def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_phone(db: Session, phone: str):
    """Get user by phone number"""
    return db.query(User).filter(User.phone == phone).first()


def get_user_by_id_number(db: Session, id_number: str):
    """Get user by ID number"""
    return db.query(User).filter(User.id_number == id_number).first()


def create_user(db: Session, user_data: UserCreate):
    """Create a new user"""
    # Check if user already exists
    if get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if get_user_by_phone(db, user_data.phone):
        raise HTTPException(status_code=400, detail="Phone number already registered")
    if get_user_by_id_number(db, user_data.id_number):
        raise HTTPException(status_code=400, detail="ID number already registered")

    # Hash the password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user instance
    db_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hashed_password,
        address=user_data.address,
        city=user_data.city,
        province=user_data.province,
        id_number=user_data.id_number,
        interests=user_data.interests,
        safety_preferences=user_data.safety_preferences,
        terms_accepted=user_data.terms_accepted,
        privacy_accepted=user_data.privacy_accepted,
        safety_guidelines_accepted=user_data.safety_guidelines_accepted,
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    """Authenticate a user with email and password"""
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def login_and_issue_token(db: Session, email: str, password: str):
    """Login user and issue JWT token"""
    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time
    user.last_login_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    return access_token, user


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Get the current active user"""
    if current_user.status != "active":
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def verify_token(token: str):
    """Verify a JWT token and return its payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )