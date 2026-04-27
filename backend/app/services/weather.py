import httpx
from datetime import datetime, timedelta
from app.config import settings
from app.models.cache import WeatherCache

async def get_weather_severity(lat: float, lng: float) -> float:
    # First check cache
    # Basic bounding box grouping to hit cache roughly for nearby places
    lat_r = round(lat, 2)
    lng_r = round(lng, 2)
    
    cache = await WeatherCache.find_one(
        WeatherCache.lat == lat_r, 
        WeatherCache.lng == lng_r,
        WeatherCache.expires_at > datetime.utcnow()
    )
    
    if cache:
        return cache.severity_score
        
    try:
        if not settings.openweather_api_key:
            return 0.2  # Return a mock if key is empty
            
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat_r}&lon={lng_r}&appid={settings.openweather_api_key}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            
        if resp.status_code == 200:
            data = resp.json()
            # Simple severity logic based on OpenWeatherMap ID codes
            # 2xx Thunderstorm, 5xx Rain, etc.
            severity = 0.0
            for w in data.get("weather", []):
                wi = w.get("id", 800)
                if wi < 300:
                    severity = max(severity, 0.9)
                elif wi < 600:
                    severity = max(severity, 0.6)
                elif wi < 700:
                    severity = max(severity, 0.8)  # Snow
                elif wi < 800:
                    severity = max(severity, 0.5)  # Fog/Mist
            
            new_cache = WeatherCache(
                lat=lat_r,
                lng=lng_r,
                weather_data=data,
                severity_score=severity,
                expires_at=datetime.utcnow() + timedelta(minutes=60)
            )
            await new_cache.insert()
            return severity
            
    except Exception as e:
        print(f"Weather API Error: {e}")
        
    return 0.2  # Neutral fallback
