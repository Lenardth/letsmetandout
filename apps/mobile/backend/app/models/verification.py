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
