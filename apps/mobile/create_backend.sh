#!/bin/bash

# Create backend structure
mkdir -p backend/{app/{models,schemas,routes,services,utils},tests}

# Create __init__.py files
touch backend/__init__.py
touch backend/app/__init__.py
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py
touch backend/app/routes/__init__.py
touch backend/app/services/__init__.py
touch backend/app/utils/__init__.py
touch backend/tests/__init__.py

# Create requirements.txt
cat > backend/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
python-dotenv==1.0.0
twilio==8.13.0
geopy==2.3.0
googlemaps==4.10.0
python-multipart==0.0.6
email-validator==2.1.0
redis==5.0.1
celery==5.3.4
EOF

# Create app/__init__.py
cat > backend/app/__init__.py << 'EOF'
from fastapi import FastAPI
from app.routes import auth, users, emergency, safety, verification
from app.utils.database import engine, Base
from app.config import settings

def create_app():
    app = FastAPI(
        title="Social Safety API",
        description="Backend API for Social Safety Mobile App",
        version="1.0.0"
    )
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Include routers
    app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
    app.include_router(users.router, prefix="/users", tags=["Users"])
    app.include_router(emergency.router, prefix="/emergency", tags=["Emergency"])
    app.include_router(safety.router, prefix="/safety", tags=["Safety"])
    app.include_router(verification.router, prefix="/verification", tags=["Verification"])
    
    return app
EOF

# Create app/config.py
cat > backend/app/config.py << 'EOF'
import os
from dotenv import load_dotenv
from pydantic import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/social_safety")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Twilio (SMS)
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER")
    
    # Google Maps
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    class Config:
        env_file = ".env"

settings = Settings()
EOF

# Create app/utils/database.py
cat > backend/app/utils/database.py << 'EOF'
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOF

# Create app/utils/security.py
cat > backend/app/utils/security.py << 'EOF'
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
EOF

# Create app/utils/sms.py
cat > backend/app/utils/sms.py << 'EOF'
from twilio.rest import Client
from app.config import settings

def send_sms(to_number: str, message: str):
    if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
        print(f"SMS would be sent to {to_number}: {message}")
        return
    
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    try:
        message = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_number
        )
        return message.sid
    except Exception as e:
        print(f"Failed to send SMS: {e}")
        return None
EOF

# Create app/utils/geolocation.py
cat > backend/app/utils/geolocation.py << 'EOF'
import googlemaps
from app.config import settings

gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY) if settings.GOOGLE_MAPS_API_KEY else None

def get_address_from_coordinates(lat: float, lng: float):
    if not gmaps:
        return f"Approximate location: {lat}, {lng}"
    
    try:
        reverse_geocode_result = gmaps.reverse_geocode((lat, lng))
        if reverse_geocode_result:
            return reverse_geocode_result[0]['formatted_address']
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    return f"Location: {lat}, {lng}"
EOF

# Create app/models/user.py
cat > backend/app/models/user.py << 'EOF'
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON
from sqlalchemy.sql import func
from app.utils.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, index=True)
    avatar_url = Column(String)
    location = Column(String)
    join_date = Column(DateTime, default=func.now())
    rating = Column(Float, default=0.0)
    total_meetups = Column(Integer, default=0)
    groups_joined = Column(Integer, default=0)
    safety_score = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    safety_settings = Column(JSON, default={
        "location_sharing": True,
        "safety_checkins": True,
        "emergency_alerts": True,
        "group_verification": True
    })
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
EOF

# Create app/models/emergency_contact.py
cat > backend/app/models/emergency_contact.py << 'EOF'
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.utils.database import Base

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    relation = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="emergency_contacts")

User.emergency_contacts = relationship("EmergencyContact", back_populates="user", cascade="all, delete-orphan")
EOF

# Create app/models/safety_alert.py
cat > backend/app/models/safety_alert.py << 'EOF'
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.utils.database import Base

class SafetyAlert(Base):
    __tablename__ = "safety_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    alert_type = Column(String, nullable=False)  # emergency, checkin, warning
    latitude = Column(Float)
    longitude = Column(Float)
    location_address = Column(String)
    message = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    resolved_at = Column(DateTime)
    
    user = relationship("User")

User.safety_alerts = relationship("SafetyAlert", back_populates="user")
EOF

# Create app/models/verification.py
cat > backend/app/models/verification.py << 'EOF'
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.utils.database import Base

class Verification(Base):
    __tablename__ = "verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verification_type = Column(String, nullable=False)  # id, phone, address, email
    status = Column(String, default="pending")  # pending, verified, rejected
    document_url = Column(String)
    verified_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    
    user = relationship("User")

User.verifications = relationship("Verification", back_populates="user")
EOF

# Create app/schemas/user.py
cat > backend/app/schemas/user.py << 'EOF'
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
EOF

# Create app/schemas/emergency_contact.py
cat > backend/app/schemas/emergency_contact.py << 'EOF'
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
EOF

# Create app/schemas/safety.py
cat > backend/app/schemas/safety.py << 'EOF'
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
EOF

# Create app/schemas/auth.py
cat > backend/app/schemas/auth.py << 'EOF'
from pydantic import BaseModel, EmailStr

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int
EOF

# Create app/services/auth.py
cat > backend/app/services/auth.py << 'EOF'
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username,
        phone=user.phone,
        password_hash=hashed_password,
        avatar_url=user.avatar_url,
        location=user.location
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user
EOF

# Create app/services/emergency.py
cat > backend/app/services/emergery.py << 'EOF'
from sqlalchemy.orm import Session
from app.models.emergency_contact import EmergencyContact
from app.models.safety_alert import SafetyAlert
from app.schemas.emergency_contact import EmergencyContactCreate
from app.schemas.safety import SafetyAlertCreate
from app.utils.sms import send_sms
from app.utils.geolocation import get_address_from_coordinates

def create_emergency_contact(db: Session, user_id: int, contact: EmergencyContactCreate):
    db_contact = EmergencyContact(**contact.dict(), user_id=user_id)
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def get_user_emergency_contacts(db: Session, user_id: int):
    return db.query(EmergencyContact).filter(EmergencyContact.user_id == user_id).all()

def delete_emergency_contact(db: Session, contact_id: int, user_id: int):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.user_id == user_id
    ).first()
    if contact:
        db.delete(contact)
        db.commit()
    return contact

def create_safety_alert(db: Session, user_id: int, alert: SafetyAlertCreate):
    location_address = None
    if alert.latitude and alert.longitude:
        location_address = get_address_from_coordinates(alert.latitude, alert.longitude)
    
    db_alert = SafetyAlert(
        **alert.dict(),
        user_id=user_id,
        location_address=location_address
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def send_emergency_alerts(db: Session, user_id: int, alert: SafetyAlertCreate):
    # Create the alert
    db_alert = create_safety_alert(db, user_id, alert)
    
    # Get emergency contacts
    contacts = get_user_emergency_contacts(db, user_id)
    
    # Send alerts to contacts
    for contact in contacts:
        message = f"EMERGENCY ALERT: {db_alert.message or 'User needs help!'}"
        if db_alert.location_address:
            message += f" Location: {db_alert.location_address}"
        
        send_sms(contact.phone, message)
    
    return db_alert
EOF

# Create app/services/verification.py
cat > backend/app/services/verification.py << 'EOF'
from sqlalchemy.orm import Session
from app.models.verification import Verification

def create_verification_request(db: Session, user_id: int, verification_type: str, document_url: str = None):
    verification = Verification(
        user_id=user_id,
        verification_type=verification_type,
        document_url=document_url,
        status="pending"
    )
    db.add(verification)
    db.commit()
    db.refresh(verification)
    return verification

def get_user_verifications(db: Session, user_id: int):
    return db.query(Verification).filter(Verification.user_id == user_id).all()

def update_verification_status(db: Session, verification_id: int, status: str):
    verification = db.query(Verification).filter(Verification.id == verification_id).first()
    if verification:
        verification.status = status
        if status == "verified":
            from datetime import datetime
            verification.verified_at = datetime.utcnow()
        db.commit()
        db.refresh(verification)
    return verification
EOF

# Create app/routes/auth.py
cat > backend/app/routes/auth.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.utils.database import get_db
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import create_user, authenticate_user, get_user_by_email
from app.utils.security import create_access_token
from app.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    return create_user(db, user)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
EOF

# Create app/routes/users.py
cat > backend/app/routes/users.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth import get_user_by_email
from app.utils.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = user_update.dict(exclude_unset=True)
    
    if "email" in update_data and update_data["email"] != current_user.email:
        existing_user = get_user_by_email(db, update_data["email"])
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
EOF

# Create app/routes/emergency.py
cat > backend/app/routes/emergency.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.utils.security import get_current_user
from app.schemas.emergency_contact import EmergencyContactCreate, EmergencyContactResponse
from app.schemas.safety import SafetyAlertCreate, SafetyAlertResponse
from app.services.emergency import (
    create_emergency_contact,
    get_user_emergency_contacts,
    delete_emergency_contact,
    send_emergency_alerts
)
from app.models.user import User

router = APIRouter()

@router.get("/contacts", response_model=list[EmergencyContactResponse])
def get_emergency_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_emergency_contacts(db, current_user.id)

@router.post("/contacts", response_model=EmergencyContactResponse)
def add_emergency_contact(
    contact: EmergencyContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_emergency_contact(db, current_user.id, contact)

@router.delete("/contacts/{contact_id}")
def remove_emergency_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = delete_emergency_contact(db, contact_id, current_user.id)
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency contact not found"
        )
    return {"message": "Emergency contact deleted successfully"}

@router.post("/alert", response_model=SafetyAlertResponse)
def send_emergency_alert(
    alert: SafetyAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return send_emergency_alerts(db, current_user.id, alert)
EOF

# Create app/routes/safety.py
cat > backend/app/routes/safety.py << 'EOF'
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
EOF

# Create app/routes/verification.py
cat > backend/app/routes/verification.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.utils.security import get_current_user
from app.services.verification import create_verification_request, get_user_verifications
from app.models.user import User
import uuid
import os

router = APIRouter()

@router.get("/status")
def get_verification_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_verifications(db, current_user.id)

@router.post("/request/{verification_type}")
def request_verification(
    verification_type: str,
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save file if provided
    document_url = None
    if file:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join("uploads", filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        document_url = f"/uploads/{filename}"
    
    return create_verification_request(db, current_user.id, verification_type, document_url)
EOF

# Create app/main.py
cat > backend/app/main.py << 'EOF'
from fastapi import FastAPI
from app.routes import auth, users, emergency, safety, verification
from app.utils.database import engine, Base
from app.utils.security import get_current_user
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Social Safety API",
    description="Backend API for Social Safety Mobile App",
    version="1.0.0"
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(emergency.router, prefix="/emergency", tags=["Emergency"])
app.include_router(safety.router, prefix="/safety", tags=["Safety"])
app.include_router(verification.router, prefix="/verification", tags=["Verification"])

@app.get("/")
def root():
    return {"message": "Social Safety API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
EOF

# Create run.py
cat > backend/run.py << 'EOF'
import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
EOF

# Create .env example
cat > backend/.env << 'EOF'
DATABASE_URL=postgresql://username:password@localhost/social_safety
SECRET_KEY=your-super-secret-jwt-key-here
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
REDIS_URL=redis://localhost:6379
EOF

echo "Backend structure created successfully!"