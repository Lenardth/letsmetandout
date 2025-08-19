import googlemaps
from app.config import settings

gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY) if settings.GOOGLE_MAPS_API_KEY else None

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
