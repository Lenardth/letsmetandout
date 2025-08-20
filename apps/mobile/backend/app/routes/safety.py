"""
Safety routes for SafeMeet application
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.utils.database import get_db
from app.utils.security import get_current_verified_user
from app.schemas.safety import SafetyPreferencesUpdate, SafetyCheckInCreate
from app.utils.geolocation import (
    get_safe_areas_in_city, get_safety_score_for_area,
    get_nearest_police_station, validate_south_african_coordinates,
    get_emergency_contacts
)
from app.models.user import User
from app.models.safety import SafetyCheckIn

router = APIRouter()


def generate_location_recommendations(safety_data: Dict[str, Any], nearest_police: Dict[str, Any]) -> List[str]:
    """Generate safety recommendations based on location data"""
    recommendations = []
    
    if safety_data.get('safety_score', 0) < 5:
        recommendations.append("This area has a low safety rating. Consider meeting in a more public place.")
    
    if nearest_police and nearest_police.get('distance_km', 0) > 5:
        recommendations.append("Nearest police station is relatively far. Stay alert and share your location with trusted contacts.")
    
    if safety_data.get('crime_incidents', 0) > 10:
        recommendations.append("High crime incidents reported in this area. Avoid isolated spots.")
    
    recommendations.append("Always let someone know your meeting details and expected return time.")
    recommendations.append("Keep emergency contacts easily accessible.")
    
    return recommendations


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
    valid_cities = ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein"]
    if city.title() not in valid_cities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"City not supported. Available cities: {', '.join(valid_cities)}"
        )
    
    try:
        city_info = get_safe_areas_in_city(city.title())
        
        return {
            "city": city.title(),
            "safe_areas": city_info.get("safe_areas", []),
            "landmarks": city_info.get("landmarks", []),
            "emergency_services": city_info.get("emergency_services", {}),
            "safety_tips": city_info.get("safety_tips", [])
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve safety information for {city}"
        )


@router.get("/emergency-contacts")
async def get_emergency_contacts_info(
    current_user: User = Depends(get_current_verified_user)
):
    """Get emergency contacts for the user's current location"""
    try:
        # In a real implementation, we would get the user's current location
        # For now, we'll return general South African emergency contacts
        contacts = get_emergency_contacts()
        
        return {
            "national_emergency": contacts.get("national", []),
            "local_contacts": contacts.get("local", []),
            "medical_services": contacts.get("medical", []),
            "user_emergency_contacts": current_user.emergency_contacts or []
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve emergency contacts"
        )


@router.post("/check-in")
async def safety_check_in(
    check_in_data: SafetyCheckInCreate,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Create a safety check-in for the user"""
    try:
        # Validate coordinates
        if not validate_south_african_coordinates(check_in_data.latitude, check_in_data.longitude):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coordinates must be within South African borders"
            )
        
        # Create check-in record
        check_in = SafetyCheckIn(
            user_id=current_user.id,
            latitude=check_in_data.latitude,
            longitude=check_in_data.longitude,
            note=check_in_data.note,
            expected_return=check_in_data.expected_return
        )
        
        db.add(check_in)
        db.commit()
        db.refresh(check_in)
        
        return {
            "message": "Safety check-in recorded successfully",
            "check_in_id": check_in.id,
            "check_in_time": check_in.created_at
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record safety check-in"
        )


@router.get("/check-ins")
async def get_safety_check_ins(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Get user's safety check-in history"""
    check_ins = db.query(SafetyCheckIn).filter(
        SafetyCheckIn.user_id == current_user.id
    ).order_by(
        SafetyCheckIn.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return {
        "check_ins": check_ins,
        "total": db.query(SafetyCheckIn).filter(SafetyCheckIn.user_id == current_user.id).count()
    }


@router.post("/alert/trigger")
async def trigger_emergency_alert(
    latitude: float,
    longitude: float,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Trigger an emergency alert"""
    try:
        # Validate coordinates
        if not validate_south_african_coordinates(latitude, longitude):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coordinates must be within South African borders"
            )
        
        # Get safety information for the area
        safety_data = get_safety_score_for_area(latitude, longitude)
        nearest_police = get_nearest_police_station(latitude, longitude)
        
        # In a real implementation, we would:
        # 1. Notify emergency contacts
        # 2. Send alerts to authorities if user preferences allow
        # 3. Log the emergency event
        
        return {
            "message": "Emergency alert triggered successfully",
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "safety_information": safety_data,
            "nearest_police_station": nearest_police,
            "timestamp": datetime.utcnow(),
            "alert_id": f"emergency_{current_user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger emergency alert"
        )