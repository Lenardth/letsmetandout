"""
Verification routes for SafeMeet application
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.utils.database import get_db
from app.utils.security import get_current_active_user
from app.services.verification import VerificationService
from app.models.user import User
from app.models.verification import DocumentType, VerificationDocument, BackgroundCheck

router = APIRouter()
verification_service = VerificationService()


@router.post("/upload-document")
async def upload_verification_document(
    document_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload verification document"""
    
    # Check if user can upload documents
    from app.utils.security import PermissionChecker
    if not PermissionChecker.can_upload_documents(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account must be in pending verification status to upload documents"
        )
    
    # Check if user already has a pending or approved document of this type
    existing_doc = db.query(VerificationDocument).filter(
        VerificationDocument.user_id == current_user.id,
        VerificationDocument.document_type == document_type,
        VerificationDocument.status.in_(["pending", "under_review", "approved"])
    ).first()
    
    if existing_doc and existing_doc.status.value == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{document_type.value.replace('_', ' ').title()} is already verified"
        )
    
    try:
        document = verification_service.upload_verification_document(
            db, current_user.id, document_type, file
        )
        
        return {
            "message": "Document uploaded successfully",
            "document_id": document.id,
            "document_type": document.document_type.value,
            "status": document.status.value,
            "uploaded_at": document.created_at,
            "next_steps": "Your document is being reviewed. You'll be notified within 24-48 hours."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )


@router.get("/status")
async def get_verification_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive verification status"""
    return verification_service.get_verification_status(db, current_user.id)


@router.get("/documents")
async def get_user_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's uploaded verification documents"""
    documents = db.query(VerificationDocument).filter(
        VerificationDocument.user_id == current_user.id
    ).order_by(VerificationDocument.created_at.desc()).all()
    
    return {
        "documents": [
            {
                "id": doc.id,
                "document_type": doc.document_type.value,
                "status": doc.status.value,
                "file_name": doc.file_name,
                "uploaded_at": doc.created_at,
                "verified_at": doc.verified_at,
                "rejection_reason": doc.rejection_reason,
                "ai_confidence_score": doc.ai_confidence_score
            }
            for doc in documents
        ]
    }


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a verification document (only if rejected or pending)"""
    document = db.query(VerificationDocument).filter(
        VerificationDocument.id == document_id,
        VerificationDocument.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if document.status.value == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete approved documents"
        )
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}


@router.post("/background-check")
async def request_background_check(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Request optional background check for premium verification"""
    
    try:
        background_check = verification_service.request_background_check(db, current_user.id)
        
        return {
            "message": "Background check requested successfully",
            "check_id": background_check.id,
            "status": background_check.status.value,
            "estimated_completion": "3-5 business days",
            "cost": "R299.00",  # Example cost
            "next_steps": [
                "Background check is being processed",
                "You'll receive an email notification when complete",
                "Results will be available in your verification status"
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to request background check"
        )


@router.get("/background-checks")
async def get_background_checks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's background check history"""
    checks = db.query(BackgroundCheck).filter(
        BackgroundCheck.user_id == current_user.id
    ).order_by(BackgroundCheck.requested_at.desc()).all()
    
    return {
        "background_checks": [
            {
                "id": check.id,
                "check_type": check.check_type,
                "status": check.status.value,
                "passed": check.passed,
                "risk_level": check.risk_level,
                "requested_at": check.requested_at,
                "completed_at": check.completed_at,
                "expires_at": check.expires_at,
                "results_summary": check.results_summary if check.status.value == "approved" else None
            }
            for check in checks
        ]
    }


@router.get("/requirements")
async def get_verification_requirements():
    """Get verification requirements and guidelines"""
    return {
        "document_requirements": {
            "id_document": {
                "title": "South African ID Document",
                "description": "Clear photo of both sides of your South African ID book or smart ID card",
                "file_types": ["JPG", "PNG", "PDF"],
                "max_size_mb": 10,
                "requirements": [
                    "Photo must be clear and readable",
                    "All four corners must be visible",
                    "No glare or shadows",
                    "Both front and back required"
                ]
            },
            "proof_of_address": {
                "title": "Proof of Address",
                "description": "Recent document showing your current residential address",
                "file_types": ["JPG", "PNG", "PDF"],
                "max_size_mb": 10,
                "accepted_documents": [
                    "Utility bill (not older than 3 months)",
                    "Bank statement (not older than 3 months)",
                    "Municipal account",
                    "Lease agreement",
                    "Rates and taxes account"
                ],
                "requirements": [
                    "Document must be in your name",
                    "Address must match your profile",
                    "Document must be recent (within 3 months)",
                    "All text must be clearly readable"
                ]
            },
            "selfie_photo": {
                "title": "Selfie Photo",
                "description": "Clear selfie photo for identity verification",
                "file_types": ["JPG", "PNG"],
                "max_size_mb": 5,
                "requirements": [
                    "Face must be clearly visible",
                    "Good lighting - no shadows",
                    "Look directly at camera",
                    "No sunglasses or hats",
                    "Plain background preferred",
                    "Minimum 300x300 pixels"
                ]
            }
        },
        "verification_levels": {
            "basic": {
                "name": "Basic Verification",
                "requirements": ["Email verified", "Phone verified"],
                "features": ["Basic profile", "Join public groups"]
            },
            "standard": {
                "name": "Standard Verification", 
                "requirements": ["Basic verification", "ID document verified", "Proof of address", "Selfie photo"],
                "features": ["Full profile access", "Create groups", "Location sharing", "Emergency features"]
            },
            "premium": {
                "name": "Premium Verification",
                "requirements": ["Standard verification", "Background check passed"],
                "features": ["Premium groups", "Event hosting", "Verified badge", "Priority support"]
            }
        },
        "processing_time": {
            "documents": "24-48 hours",
            "background_check": "3-5 business days"
        },
        "support": {
            "email": "verification@safemeet.co.za",
            "phone": "+27 11 123 4567",
            "hours": "Monday to Friday, 9:00 AM - 5:00 PM SAST"
        }
    }


@router.get("/tips")
async def get_verification_tips():
    """Get tips for successful verification"""
    return {
        "photo_tips": {
            "lighting": [
                "Use natural light when possible",
                "Avoid harsh shadows",
                "Ensure even lighting across the document"
            ],
            "positioning": [
                "Place document on flat, contrasting surface",
                "Keep camera parallel to document",
                "Fill the frame with the document",
                "Ensure all corners are visible"
            ],
            "quality": [
                "Use highest camera resolution",
                "Keep camera steady - use timer if needed",
                "Ensure all text is readable",
                "Avoid blurry or pixelated images"
            ]
        },
        "common_mistakes": [
            "Document partially cut off in photo",
            "Glare or reflections making text unreadable", 
            "Blurry or low-resolution images",
            "Wrong document type uploaded",
            "Expired documents",
            "Documents not in applicant's name"
        ],
        "selfie_tips": [
            "Remove glasses and hats",
            "Look directly at camera",
            "Neutral facial expression",
            "Plain background",
            "Good lighting on face",
            "Hold phone steady"
        ]
    }


# Admin routes (would typically be in a separate admin router)
@router.post("/admin/approve/{document_id}")
async def admin_approve_document(
    document_id: int,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
    # admin_user: User = Depends(get_admin_user)  # Would need admin auth
):
    """Admin endpoint to approve verification document"""
    # This would typically require admin authentication
    document = verification_service.approve_document(db, document_id, 1, notes)  # 1 = admin_id
    
    return {
        "message": "Document approved successfully",
        "document_id": document.id,
        "status": document.status.value,
        "verified_at": document.verified_at
    }


@router.post("/admin/reject/{document_id}")
async def admin_reject_document(
    document_id: int,
    reason: str = Form(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
    # admin_user: User = Depends(get_admin_user)  # Would need admin auth
):
    """Admin endpoint to reject verification document"""
    # This would typically require admin authentication
    document = verification_service.reject_document(db, document_id, 1, reason, notes)  # 1 = admin_id
    
    return {
        "message": "Document rejected",
        "document_id": document.id,
        "status": document.status.value,
        "rejection_reason": document.rejection_reason
    }