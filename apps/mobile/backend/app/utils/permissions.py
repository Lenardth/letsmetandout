"""
Permission utilities for SafeMeet application
"""
from fastapi import HTTPException, status
from app.models.user import User, UserStatus


class PermissionChecker:
    @staticmethod
    def can_upload_documents(user: User) -> bool:
        """Check if user can upload verification documents"""
        return user.status in [UserStatus.PENDING_VERIFICATION, UserStatus.ACTIVE]
    
    @staticmethod
    def can_request_background_check(user: User) -> bool:
        """Check if user can request background check"""
        return user.status == UserStatus.ACTIVE and user.id_verified