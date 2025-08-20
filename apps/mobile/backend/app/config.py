# app/config.py
"""
Configuration settings for SafeMeet backend
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv  # <--- 1. IMPORT THIS

# This line explicitly finds and loads the .env file from your project's root directory
load_dotenv() # <--- 2. ADD THIS LINE TO EXECUTE IT

class Settings(BaseSettings):
    # Database
    # This will now correctly read the value from the loaded .env file
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://localhost/safemeet_db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # File Storage (AWS S3)
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "safemeet-documents")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    
    # SMS Service (Twilio)
    TWILIO_ACCOUNT_SID: Optional[str] = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: Optional[str] = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER: Optional[str] = os.getenv("TWILIO_PHONE_NUMBER")
    
    # Email Service
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    
    # Redis (for caching and background tasks)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Verification Services
    ID_VERIFICATION_API_KEY: Optional[str] = os.getenv("ID_VERIFICATION_API_KEY")
    BACKGROUND_CHECK_API_KEY: Optional[str] = os.getenv("BACKGROUND_CHECK_API_KEY")
    
    # App Settings
    APP_NAME: str = "SafeMeet"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:19006",  # Expo
        "https://your-frontend-domain.com"
    ]
    
    # This is no longer strictly necessary but doesn't hurt to keep
    class Config:
        env_file = ".env"

settings = Settings( )

# --- TEMPORARY DEBUG LINE ---
# This will print the database URL to your console when the app starts.
print("---" * 10)
print(f"DEBUG: DATABASE_URL loaded as: {settings.DATABASE_URL}")
print("---" * 10)
