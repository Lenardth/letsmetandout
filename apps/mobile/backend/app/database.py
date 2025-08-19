# app/database.py
"""
Database configuration and setup for SafeMeet application
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Get database URL from environment variable, default to SQLite
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./safemeet.db"
)

# Handle SQLite-specific configuration
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False  # Set to True for SQL query logging
    )
else:
    # For PostgreSQL or other databases
    engine = create_engine(DATABASE_URL, echo=False)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    """
    Dependency function to get database session.
    Use this in your FastAPI route dependencies.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to create all tables
def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)

# Function to drop all tables (use with caution!)
def drop_tables():
    """Drop all tables in the database"""
    Base.metadata.drop_all(bind=engine)