"""
Safety routes for SafeMeet application
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.utils.database import get_db
from app.utils.security import get_current_verified_user
from app.schemas.safety import SafetyPreferencesUpdate
from app.utils.geolocation import (
    get_safe_areas_in_city, get_safety_score_for_area,
    get_nearest_police_station, validate_south_african_coordinates
)
from app.models.user import User

router = APIRouter()


@router.get("/preferences")
async def get_safety_preferences(
    current_user: User = Depends(get_current_verified_user)
):
    """Get user's safety preferences"""
    
    default_preferences = {
        "location_sharing": True,
        "emergency_alerts": True,
        "group_verification": True,
        "background_check": False,
        "auto_check_in": False,
        "check_in_interval_minutes": 60,
        "late_return_threshold_minutes": 30
    }
    
    # Merge user preferences with defaults
    user_prefs = current_user.safety_preferences or {}
    preferences = {**default_preferences, **user_prefs}
    
    return {
        "user_id": current_user.id,
        "preferences": preferences,
        "last_updated": current_user.updated_at
    }


@router.put("/preferences")
async def update_safety_preferences(
    preferences_data: SafetyPreferencesUpdate,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Update user's safety preferences"""
    
    # Get current preferences
    current_prefs = current_user.safety_preferences or {}
    
    # Update only provided fields
    update_data = preferences_data.dict(exclude_unset=True)
    updated_prefs = {**current_prefs, **update_data}
    
    # Update user preferences
    current_user.safety_preferences = updated_prefs
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Safety preferences updated successfully",
        "preferences": updated_prefs,
        "updated_at": current_user.updated_at
    }


@router.get("/area-info")
async def get_area_safety_info(
    latitude: float,
    longitude: float,
    current_user: User = Depends(get_current_verified_user)
):
    """Get safety information for a specific area"""
    
    # Validate coordinates are in South Africa
    if not validate_south_african_coordinates(latitude, longitude):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coordinates must be within South African borders"
        )
    
    try:
        # Get safety score and information
        safety_data = get_safety_score_for_area(latitude, longitude)
        
        # Get nearest police station
        nearest_police = get_nearest_police_station(latitude, longitude)
        
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "safety_assessment": safety_data,
            "nearest_police_station": nearest_police,
            "recommendations": generate_location_recommendations(safety_data, nearest_police)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve area safety information"
        )


@router.get("/city-info/{city}")
async def get_city_safety_info(
    city: str,
    current_user: User = Depends(get_current_verified_user)
):
    """Get safety information for a South African city"""
    
    # Validate city
    valid_cities = ["Cape Town", "Johannesburg", "Durban", "Pretoria"]
    if city not in valid_cities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"City must be one of: {', '.join(valid_cities)}"
        )
    
    city_info = get_safe_areas_in_city(city)
    
    return {
        "city": city,
        "safe_areas": city_info.get("safe_areas", []),
        "landmarks": city_info.