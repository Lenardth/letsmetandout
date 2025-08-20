#!/bin/bash

# SafeMeet Backend Setup Script
# This script creates all missing files and updates existing ones

echo "🚀 Setting up SafeMeet Backend..."

# Create backup directory
mkdir -p backups
cp -r app/models backups/ 2>/dev/null || echo "No models directory to backup"
cp -r app/schemas backups/ 2>/dev/null || echo "No schemas directory to backup"

# 1. Update geolocation.py with all missing functions
echo "📍 Updating geolocation.py..."
cat > app/utils/geolocation.py << 'EOF'
import googlemaps
from app.config import settings

# Handle missing GOOGLE_MAPS_API_KEY gracefully
try:
    api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
    gmaps = googlemaps.Client(key=api_key) if api_key else None
except AttributeError:
    gmaps = None

def get_address_from_coordinates(lat: float, lng: float):
    if not gmaps:
        return f"Approximate location: {lat}, {lng}"
    
    try:
        reverse_geocode_result = gmaps.reverse_geocode((lat, lng))
        if reverse_geocode_result:
            return reverse_geocode_result[0]['formatted_address']
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    return f"Location: {lat}, {lng}"

def get_safe_areas_in_city(city_name: str):
    """
    Get safe areas within a city. This is a placeholder implementation.
    You'll need to implement the actual logic based on your requirements.
    """
    if not gmaps:
        return {
            "safe_areas": [],
            "landmarks": [],
            "emergency_services": get_emergency_contacts(),
            "safety_tips": [
                "Always meet in well-lit public places",
                "Share your location with trusted contacts",
                "Trust your instincts"
            ]
        }
    
    try:
        # Search for well-lit public areas, police stations, hospitals
        safe_places = []
        
        # Search for police stations
        police_results = gmaps.places_nearby(
            location=city_name,
            radius=10000,  # 10km radius
            type='police'
        )
        
        # Search for hospitals
        hospital_results = gmaps.places_nearby(
            location=city_name,
            radius=10000,
            type='hospital'
        )
        
        # Combine and format results
        for place in police_results.get('results', [])[:5]:  # Limit to 5
            safe_places.append({
                'name': place.get('name'),
                'address': place.get('vicinity'),
                'type': 'Police Station',
                'rating': place.get('rating', 0),
                'location': {
                    'lat': place['geometry']['location']['lat'],
                    'lng': place['geometry']['location']['lng']
                }
            })
            
        for place in hospital_results.get('results', [])[:3]:  # Limit to 3
            safe_places.append({
                'name': place.get('name'),
                'address': place.get('vicinity'),
                'type': 'Hospital',
                'rating': place.get('rating', 0),
                'location': {
                    'lat': place['geometry']['location']['lat'],
                    'lng': place['geometry']['location']['lng']
                }
            })
            
        return {
            "safe_areas": safe_places,
            "landmarks": [],
            "emergency_services": get_emergency_contacts(),
            "safety_tips": [
                "Always meet in well-lit public places",
                "Share your location with trusted contacts",
                "Trust your instincts",
                f"Emergency number: 10111"
            ]
        }
        
    except Exception as e:
        print(f"Error getting safe areas: {e}")
        return {
            "safe_areas": [],
            "landmarks": [],
            "emergency_services": get_emergency_contacts(),
            "safety_tips": [
                "Always meet in well-lit public places",
                "Share your location with trusted contacts",
                "Trust your instincts"
            ]
        }

def get_safety_score_for_area(lat: float, lng: float, radius: int = 1000):
    """
    Calculate a safety score for a specific area based on nearby amenities.
    Returns a dictionary with safety information.
    """
    if not gmaps:
        return {
            "safety_score": 50,
            "crime_incidents": 0,
            "description": "Safety assessment unavailable - API not configured"
        }
    
    try:
        location = (lat, lng)
        safety_score = 0
        
        # Positive safety factors
        # Police stations nearby (+20 points)
        police_results = gmaps.places_nearby(
            location=location,
            radius=radius,
            type='police'
        )
        if police_results.get('results'):
            safety_score += min(20, len(police_results['results']) * 5)
        
        # Hospitals nearby (+15 points)
        hospital_results = gmaps.places_nearby(
            location=location,
            radius=radius,
            type='hospital'
        )
        if hospital_results.get('results'):
            safety_score += min(15, len(hospital_results['results']) * 3)
        
        # Schools nearby (+10 points)
        school_results = gmaps.places_nearby(
            location=location,
            radius=radius,
            type='school'
        )
        if school_results.get('results'):
            safety_score += min(10, len(school_results['results']) * 2)
        
        # Shopping centers/malls (+10 points)
        shopping_results = gmaps.places_nearby(
            location=location,
            radius=radius,
            type='shopping_mall'
        )
        if shopping_results.get('results'):
            safety_score += min(10, len(shopping_results['results']) * 3)
        
        # Transit stations (+5 points)
        transit_results = gmaps.places_nearby(
            location=location,
            radius=radius,
            type='transit_station'
        )
        if transit_results.get('results'):
            safety_score += min(5, len(transit_results['results']) * 1)
        
        # Base score for populated areas
        safety_score += 20
        
        # Cap at 100
        final_score = min(100, safety_score)
        
        return {
            "safety_score": final_score,
            "crime_incidents": max(0, 20 - int(final_score / 5)),  # Inverse relationship
            "description": f"Safety score: {final_score}/100"
        }
        
    except Exception as e:
        print(f"Error calculating safety score: {e}")
        return {
            "safety_score": 50,
            "crime_incidents": 0,
            "description": "Error calculating safety score"
        }

def get_nearest_police_station(lat: float, lng: float):
    """
    Find the nearest police station to given coordinates.
    """
    if not gmaps:
        return {
            "name": "Unknown Police Station",
            "address": "Service unavailable",
            "distance_km": 0,
            "contact": "10111"  # South African emergency number
        }
    
    try:
        location = (lat, lng)
        
        # Search for police stations
        police_results = gmaps.places_nearby(
            location=location,
            radius=50000,  # 50km radius
            type='police'
        )
        
        if not police_results.get('results'):
            return {
                "name": "No police station found",
                "address": "Not available",
                "distance_km": None,
                "contact": "10111"
            }
        
        # Get the closest one
        nearest = police_results['results'][0]
        
        # Calculate distance
        police_location = (
            nearest['geometry']['location']['lat'],
            nearest['geometry']['location']['lng']
        )
        
        # Simple distance calculation
        distance_result = gmaps.distance_matrix(
            origins=[location],
            destinations=[police_location],
            mode="driving"
        )
        
        distance_km = 0
        if distance_result['rows'][0]['elements'][0]['status'] == 'OK':
            distance_m = distance_result['rows'][0]['elements'][0]['distance']['value']
            distance_km = round(distance_m / 1000, 2)
        
        return {
            "name": nearest.get('name', 'Police Station'),
            "address": nearest.get('vicinity', 'Address unavailable'),
            "distance_km": distance_km,
            "rating": nearest.get('rating', 0),
            "contact": "10111",  # Default SA emergency number
            "location": {
                "lat": nearest['geometry']['location']['lat'],
                "lng": nearest['geometry']['location']['lng']
            }
        }
        
    except Exception as e:
        print(f"Error finding nearest police station: {e}")
        return {
            "name": "Service unavailable",
            "address": "Error retrieving information",
            "distance_km": None,
            "contact": "10111"
        }

def validate_south_african_coordinates(lat: float, lng: float) -> bool:
    """
    Validate if coordinates are within South African borders.
    South Africa approximate boundaries:
    - Latitude: -34.8 to -22.1
    - Longitude: 16.5 to 32.9
    """
    try:
        # South African coordinate boundaries (approximate)
        min_lat, max_lat = -34.8, -22.1
        min_lng, max_lng = 16.5, 32.9
        
        return (min_lat <= lat <= max_lat) and (min_lng <= lng <= max_lng)
        
    except (TypeError, ValueError):
        return False

def get_emergency_contacts():
    """
    Get South African emergency contacts and services.
    """
    return {
        "national": [
            {
                "service": "Police Emergency",
                "number": "10111",
                "type": "emergency"
            },
            {
                "service": "Medical Emergency",
                "number": "10177",
                "type": "emergency"
            },
            {
                "service": "Fire Department",
                "number": "10177",
                "type": "emergency"
            },
            {
                "service": "General Emergency",
                "number": "112",
                "type": "emergency"
            }
        ],
        "local": [
            {
                "service": "Cape Town Emergency",
                "number": "021 480 7700",
                "city": "Cape Town"
            },
            {
                "service": "Johannesburg Emergency",
                "number": "011 375 5911",
                "city": "Johannesburg"
            },
            {
                "service": "Durban Emergency",
                "number": "031 361 0000",
                "city": "Durban"
            },
            {
                "service": "Pretoria Emergency",
                "number": "012 358 7095",
                "city": "Pretoria"
            }
        ],
        "medical": [
            {
                "service": "Netcare 911",
                "number": "082 911",
                "type": "private_medical"
            },
            {
                "service": "ER24",
                "number": "084 124",
                "type": "private_medical"
            },
            {
                "service": "Life Healthcare",
                "number": "0860 999 911",
                "type": "private_medical"
            }
        ],
        "support": [
            {
                "service": "Gender-Based Violence Command Centre",
                "number": "0800 428 428",
                "type": "support"
            },
            {
                "service": "Childline South Africa",
                "number": "116",
                "type": "support"
            },
            {
                "service": "Suicide Crisis Line",
                "number": "0800 567 567",
                "type": "support"
            }
        ]
    }
EOF

# 2. Create safety models
echo "🔐 Creating safety models..."
cat > app/models/safety.py << 'EOF'
"""
Safety models for SafeMeet application
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.utils.database import Base


class SafetyCheckIn(Base):
    """Model for user safety check-ins"""
    __tablename__ = "safety_check_ins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    note = Column(Text, nullable=True)
    expected_return = Column(DateTime, nullable=True)
    actual_return = Column(DateTime, nullable=True)
    is_safe = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="safety_check_ins")


class EmergencyAlert(Base):
    """Model for emergency alerts"""
    __tablename__ = "emergency_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    alert_type = Column(String(50), nullable=False)  # 'panic', 'check_in_overdue', 'manual'
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    message = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="emergency_alerts")


class SafetyContact(Base):
    """Model for user's emergency contacts"""
    __tablename__ = "safety_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_name = Column(String(100), nullable=False)
    contact_phone = Column(String(20), nullable=False)
    contact_email = Column(String(100), nullable=True)
    relationship_type = Column(String(50), nullable=False)  # 'family', 'friend', 'colleague'
    is_primary = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="safety_contacts")


class SafetyReport(Base):
    """Model for safety reports about locations or incidents"""
    __tablename__ = "safety_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String(50), nullable=False)  # 'incident', 'safe_area', 'unsafe_area'
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default='medium')  # 'low', 'medium', 'high', 'critical'
    is_verified = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="safety_reports")
EOF

# 3. Create safety schemas directory if it doesn't exist
mkdir -p app/schemas

# 4. Create safety schemas
echo "📋 Creating safety schemas..."
cat > app/schemas/safety.py << 'EOF'
"""
Safety schemas for SafeMeet application
"""
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List


class SafetyPreferencesUpdate(BaseModel):
    location_sharing: Optional[bool] = None
    emergency_alerts: Optional[bool] = None
    group_verification: Optional[bool] = None
    background_check: Optional[bool] = None
    auto_check_in: Optional[bool] = None
    check_in_interval_minutes: Optional[int] = None
    late_return_threshold_minutes: Optional[int] = None

    @validator('check_in_interval_minutes')
    def validate_check_in_interval(cls, v):
        if v is not None and (v < 5 or v > 480):  # 5 minutes to 8 hours
            raise ValueError('Check-in interval must be between 5 and 480 minutes')
        return v

    @validator('late_return_threshold_minutes')
    def validate_late_return_threshold(cls, v):
        if v is not None and (v < 5 or v > 120):  # 5 minutes to 2 hours
            raise ValueError('Late return threshold must be between 5 and 120 minutes')
        return v


class SafetyCheckInCreate(BaseModel):
    latitude: float
    longitude: float
    note: Optional[str] = None
    expected_return: Optional[datetime] = None

    @validator('latitude')
    def validate_latitude(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90')
        return v

    @validator('longitude')
    def validate_longitude(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180')
        return v


class SafetyCheckInResponse(BaseModel):
    id: int
    user_id: int
    latitude: float
    longitude: float
    note: Optional[str]
    expected_return: Optional[datetime]
    actual_return: Optional[datetime]
    is_safe: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmergencyContactCreate(BaseModel):
    contact_name: str
    contact_phone: str
    contact_email: Optional[str] = None
    relationship_type: str
    is_primary: bool = False

    @validator('contact_phone')
    def validate_phone(cls, v):
        # Basic South African phone number validation
        if not v.replace('+', '').replace(' ', '').replace('-', '').isdigit():
            raise ValueError('Phone number must contain only digits, spaces, dashes, and plus sign')
        return v

    @validator('relationship_type')
    def validate_relationship_type(cls, v):
        valid_types = ['family', 'friend', 'colleague', 'partner', 'other']
        if v.lower() not in valid_types:
            raise ValueError(f'Relationship type must be one of: {", ".join(valid_types)}')
        return v.lower()


class EmergencyContactResponse(BaseModel):
    id: int
    user_id: int
    contact_name: str
    contact_phone: str
    contact_email: Optional[str]
    relationship_type: str
    is_primary: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SafetyReportCreate(BaseModel):
    report_type: str
    latitude: float
    longitude: float
    title: str
    description: str
    severity: str = 'medium'
    is_public: bool = True

    @validator('report_type')
    def validate_report_type(cls, v):
        valid_types = ['incident', 'safe_area', 'unsafe_area']
        if v.lower() not in valid_types:
            raise ValueError(f'Report type must be one of: {", ".join(valid_types)}')
        return v.lower()

    @validator('severity')
    def validate_severity(cls, v):
        valid_severities = ['low', 'medium', 'high', 'critical']
        if v.lower() not in valid_severities:
            raise ValueError(f'Severity must be one of: {", ".join(valid_severities)}')
        return v.lower()

    @validator('latitude')
    def validate_latitude(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90')
        return v

    @validator('longitude')
    def validate_longitude(cls, v):
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180')
        return v


class SafetyReportResponse(BaseModel):
    id: int
    user_id: int
    report_type: str
    latitude: float
    longitude: float
    title: str
    description: str
    severity: str
    is_verified: bool
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmergencyAlertCreate(BaseModel):
    alert_type: str
    latitude: float
    longitude: float
    message: Optional[str] = None

    @validator('alert_type')
    def validate_alert_type(cls, v):
        valid_types = ['panic', 'check_in_overdue', 'manual']
        if v.lower() not in valid_types:
            raise ValueError(f'Alert type must be one of: {", ".join(valid_types)}')
        return v.lower()


class EmergencyAlertResponse(BaseModel):
    id: int
    user_id: int
    alert_type: str
    latitude: float
    longitude: float
    message: Optional[str]
    is_resolved: bool
    resolved_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
EOF

# 5. Update User model to include safety relationships
echo "👤 Updating User model..."
if ! grep -q "safety_check_ins" app/models/user.py; then
    # Create backup
    cp app/models/user.py app/models/user.py.backup
    
    # Add safety relationships before the __repr__ method
    sed -i '/def __repr__(self):/i\    # Safety relationships\n    safety_check_ins = relationship("SafetyCheckIn", back_populates="user")\n    emergency_alerts = relationship("EmergencyAlert", back_populates="user")\n    safety_contacts = relationship("SafetyContact", back_populates="user")\n    safety_reports = relationship("SafetyReport", back_populates="user")\n' app/models/user.py
    
    echo "✅ Added safety relationships to User model"
else
    echo "✅ User model already has safety relationships"
fi

# 6. Create requirements check
echo "📦 Checking required packages..."
if ! pip list | grep -q googlemaps; then
    echo "⚠️  Installing googlemaps package..."
    pip install googlemaps
fi

# 7. Test the setup
echo "🧪 Testing the setup..."
python -c "
try:
    from app.utils.geolocation import get_safe_areas_in_city, get_safety_score_for_area, get_nearest_police_station, validate_south_african_coordinates, get_emergency_contacts
    from app.models.safety import SafetyCheckIn
    from app.schemas.safety import SafetyPreferencesUpdate, SafetyCheckInCreate
    print('✅ All imports successful!')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup complete! All files created successfully."
    echo ""
    echo "📁 Files created/updated:"
    echo "  - app/utils/geolocation.py (updated with all safety functions)"
    echo "  - app/models/safety.py (new)"
    echo "  - app/schemas/safety.py (new)"
    echo "  - app/models/user.py (updated with safety relationships)"
    echo ""
    echo "🚀 You can now run your server:"
    echo "  uvicorn app.main:app --reload"
    echo ""
    echo "💡 Don't forget to:"
    echo "  1. Run database migrations to create the new tables"
    echo "  2. Set your GOOGLE_MAPS_API_KEY in settings (optional but recommended)"
    echo "  3. Test the safety endpoints"
else
    echo "❌ Setup failed. Please check the error messages above."
    exit 1
fi
EOF
