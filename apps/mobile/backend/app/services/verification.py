"""
Verification service for SafeMeet application
"""
import os
import boto3
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from PIL import Image
import hashlib
import uuid
from datetime import datetime, timedelta

from app.config import settings
from app.models.user import User, VerificationLevel
from app.models.verification import VerificationDocument, DocumentType, VerificationStatus, BackgroundCheck


class VerificationService:
    def __init__(self):
        self.s3_client = None
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )

    def upload_verification_document(
        self, 
        db: Session, 
        user_id: int, 
        document_type: DocumentType, 
        file: UploadFile
    ) -> VerificationDocument:
        """Upload and store verification document"""
        
        # Validate file
        self._validate_file(file, document_type)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{user_id}_{document_type.value}_{uuid.uuid4()}{file_extension}"
        
        # Upload to S3
        file_url = self._upload_to_s3(file, unique_filename)
        
        # Create verification document record
        doc = VerificationDocument(
            user_id=user_id,
            document_type=document_type,
            file_url=file_url,
            file_name=file.filename,
            file_size=file.size if hasattr(file, 'size') else len(file.file.read()),
            mime_type=file.content_type,
            status=VerificationStatus.PENDING
        )
        
        # Reset file pointer
        file.file.seek(0)
        
        db.add(doc)
        db.commit()
        db.refresh(doc)
        
        # Start AI verification process
        self._start_ai_verification(doc)
        
        return doc

    def _validate_file(self, file: UploadFile, document_type: DocumentType):
        """Validate uploaded file"""
        # Check file size (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB
        if hasattr(file, 'size') and file.size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large. Maximum size is 10MB."
            )
        
        # Check file type
        allowed_types = {
            DocumentType.ID_DOCUMENT: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
            DocumentType.PROOF_OF_ADDRESS: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
            DocumentType.SELFIE_PHOTO: ['image/jpeg', 'image/jpg', 'image/png'],
        }
        
        if document_type in allowed_types:
            if file.content_type not in allowed_types[document_type]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file type. Allowed types: {', '.join(allowed_types[document_type])}"
                )
        
        # Additional validation for images
        if file.content_type.startswith('image/'):
            try:
                # Reset file pointer
                file.file.seek(0)
                image = Image.open(file.file)
                
                # Check image dimensions
                width, height = image.size
                if width < 300 or height < 300:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Image too small. Minimum dimensions: 300x300 pixels."
                    )
                
                # Reset file pointer
                file.file.seek(0)
                
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image file."
                )

    def _upload_to_s3(self, file: UploadFile, filename: str) -> str:
        """Upload file to S3 bucket"""
        if not self.s3_client:
            # For development, save locally
            upload_dir = "uploads"
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, filename)
            
            with open(file_path, "wb") as buffer:
                content = file.file.read()
                buffer.write(content)
            
            return f"/uploads/{filename}"
        
        try:
            # Upload to S3
            key = f"verification_documents/{filename}"
            self.s3_client.upload_fileobj(
                file.file,
                settings.AWS_S3_BUCKET,
                key,
                ExtraArgs={
                    'ContentType': file.content_type,
                    'ServerSideEncryption': 'AES256'
                }
            )
            
            return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload file"
            )

    def _start_ai_verification(self, doc: VerificationDocument):
        """Start AI-powered document verification"""
        # This would integrate with AI services like AWS Rekognition, Google Vision API, etc.
        # For now, we'll simulate the process
        
        # In a real implementation, you would:
        # 1. Send document to AI service for analysis
        # 2. Extract relevant information (ID number, address, face matching, etc.)
        # 3. Store results and confidence scores
        # 4. Update document status based on results
        
        # Simulated AI verification
        doc.ai_confidence_score = "85%"
        doc.ai_verification_data = '{"status": "passed", "confidence": 0.85, "extracted_data": {}}'
        doc.status = VerificationStatus.UNDER_REVIEW
        
        # In production, this would be done asynchronously
        pass

    def approve_document(
        self, 
        db: Session, 
        document_id: int, 
        admin_id: int, 
        notes: Optional[str] = None
    ) -> VerificationDocument:
        """Approve a verification document"""
        doc = db.query(VerificationDocument).filter(
            VerificationDocument.id == document_id
        ).first()
        
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        doc.status = VerificationStatus.APPROVED
        doc.verified_at = datetime.utcnow()
        doc.verified_by = admin_id
        
        # Set expiry date (2 years for ID documents)
        if doc.document_type == DocumentType.ID_DOCUMENT:
            doc.expires_at = datetime.utcnow() + timedelta(days=730)
        
        # Update user verification status
        self._update_user_verification_level(db, doc.user_id)
        
        db.commit()
        db.refresh(doc)
        
        return doc

    def reject_document(
        self, 
        db: Session, 
        document_id: int, 
        admin_id: int, 
        reason: str, 
        notes: Optional[str] = None
    ) -> VerificationDocument:
        """Reject a verification document"""
        doc = db.query(VerificationDocument).filter(
            VerificationDocument.id == document_id
        ).first()
        
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        doc.status = VerificationStatus.REJECTED
        doc.verified_at = datetime.utcnow()
        doc.verified_by = admin_id
        doc.rejection_reason = reason
        doc.rejection_notes = notes
        
        db.commit()
        db.refresh(doc)
        
        return doc

    def _update_user_verification_level(self, db: Session, user_id: int):
        """Update user's verification level based on approved documents"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return
        
        # Count approved documents
        approved_docs = db.query(VerificationDocument).filter(
            VerificationDocument.user_id == user_id,
            VerificationDocument.status == VerificationStatus.APPROVED
        ).all()
        
        doc_types = {doc.document_type for doc in approved_docs}
        
        # Check verification requirements
        has_id_document = DocumentType.ID_DOCUMENT in doc_types
        has_proof_address = DocumentType.PROOF_OF_ADDRESS in doc_types
        has_selfie = DocumentType.SELFIE_PHOTO in doc_types
        
        if has_id_document and has_proof_address and has_selfie:
            user.verification_level = VerificationLevel.STANDARD
            user.id_verified = True
            
            # Check for background check
            background_check = db.query(BackgroundCheck).filter(
                BackgroundCheck.user_id == user_id,
                BackgroundCheck.status == VerificationStatus.APPROVED,
                BackgroundCheck.passed == True
            ).first()
            
            if background_check:
                user.verification_level = VerificationLevel.PREMIUM
                user.background_check_passed = True
        
        db.commit()

    def request_background_check(self, db: Session, user_id: int) -> BackgroundCheck:
        """Request background check for user"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user has required verification level
        if not user.id_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID verification required before background check"
            )
        
        # Create background check record
        background_check = BackgroundCheck(
            user_id=user_id,
            check_type="comprehensive",
            provider="SafeMeet_Verification",
            status=VerificationStatus.PENDING
        )
        
        db.add(background_check)
        db.commit()
        db.refresh(background_check)
        
        # In production, this would trigger actual background check with third-party
        self._initiate_background_check(background_check)
        
        return background_check

    def _initiate_background_check(self, background_check: BackgroundCheck):
        """Initiate background check with third-party service"""
        # This would integrate with services like Compuscan, XDS, etc. in South Africa
        # For now, we'll simulate the process
        pass

    def get_verification_status(self, db: Session, user_id: int) -> dict:
        """Get comprehensive verification status for user"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        documents = db.query(VerificationDocument).filter(
            VerificationDocument.user_id == user_id
        ).all()
        
        background_checks = db.query(BackgroundCheck).filter(
            BackgroundCheck.user_id == user_id
        ).all()
        
        doc_status = {}
        for doc_type in DocumentType:
            user_docs = [d for d in documents if d.document_type == doc_type]
            if user_docs:
                latest_doc = max(user_docs, key=lambda x: x.created_at)
                doc_status[doc_type.value] = {
                    "status": latest_doc.status.value,
                    "uploaded_at": latest_doc.created_at,
                    "verified_at": latest_doc.verified_at,
                    "rejection_reason": latest_doc.rejection_reason
                }
            else:
                doc_status[doc_type.value] = {"status": "not_uploaded"}
        
        return {
            "user_id": user_id,
            "verification_level": user.verification_level.value,
            "email_verified": user.email_verified,
            "phone_verified": user.phone_verified,
            "id_verified": user.id_verified,
            "background_check_passed": user.background_check_passed,
            "documents": doc_status,
            "background_checks": [
                {
                    "id": bc.id,
                    "check_type": bc.check_type,
                    "status": bc.status.value,
                    "passed": bc.passed,
                    "requested_at": bc.requested_at,
                    "completed_at": bc.completed_at
                }
                for bc in background_checks
            ]
        }