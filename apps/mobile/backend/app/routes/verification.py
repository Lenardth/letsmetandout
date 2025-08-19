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
