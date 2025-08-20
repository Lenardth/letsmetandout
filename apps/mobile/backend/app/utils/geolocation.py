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
