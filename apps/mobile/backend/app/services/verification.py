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
