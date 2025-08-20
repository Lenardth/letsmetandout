"""
Verification models for SafeMeet application
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.database import Base
from enum import Enum as PyEnum


class DocumentType(PyEnum):
    ID_DOCUMENT = "id_document"
    PROOF_OF_ADDRESS = "proof_of_address"
    SELFIE_PHOTO = "selfie_photo"
    BACKGROUND_CHECK = "background_check"


class VerificationStatus(PyEnum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class VerificationDocument(Base):
    __tablename__ = "verification_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Document Information
    document_type = Column(Enum(DocumentType), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_name = Column(String(255))
    file_size = Column(Integer)  # Size in bytes
    mime_type = Column(String(100))
    
    # Verification Status
    status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    verified_at = Column(DateTime(timezone=True))
    verified_by = Column(Integer, ForeignKey("users.id"))  # Admin who verified
    
    # Rejection Information
    rejection_reason = Column(Text)
    rejection_notes = Column(Text)
    
    # AI/Service Verification Results
    ai_confidence_score = Column(String(10))  # Confidence percentage
    ai_verification_data = Column(Text)  # JSON string of AI verification results
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True))  # When verification expires (e.g., for ID documents)
    
    # Relationships - Explicitly specify foreign keys
    user = relationship("User", foreign_keys=[user_id], back_populates="verification_documents")
    verified_by_user = relationship("User", foreign_keys=[verified_by])

    def __repr__(self):
        return f"<VerificationDocument(id={self.id}, user_id={self.user_id}, type='{self.document_type.value}', status='{self.status.value}')>"


class BackgroundCheck(Base):
    __tablename__ = "background_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Check Information
    check_type = Column(String(100), nullable=False)  # "criminal", "identity", "address"
    provider = Column(String(100))  # Third-party service provider
    provider_reference = Column(String(255))  # Provider's reference number
    
    # Results
    status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    passed = Column(Boolean)
    risk_level = Column(String(20))  # "low", "medium", "high"
    
    # Detailed Results (encrypted)
    results_summary = Column(Text)
    full_results = Column(Text)  # Encrypted JSON string
    
    # Timestamps
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    
    # Relationships - Explicitly specify foreign key
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<BackgroundCheck(id={self.id}, user_id={self.user_id}, type='{self.check_type}', status='{self.status.value}')>"