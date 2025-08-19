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
