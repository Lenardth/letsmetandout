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
