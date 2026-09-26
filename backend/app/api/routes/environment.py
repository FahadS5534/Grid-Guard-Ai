from fastapi import APIRouter
from app.services.weather_service import WeatherService
from app.schemas.environment import EnvironmentSummary

router = APIRouter(prefix="/environment", tags=["Environmental & El Niño Monitor"])

@router.get("/summary", response_model=EnvironmentSummary)
async def get_environment_summary():
    curr = await WeatherService.get_current_environment()
    enso = WeatherService.get_enso_summary()
    return EnvironmentSummary(
        status=enso["status"],
        intensity=enso["description"],
        current_temp=curr["ambient_temperature"],
        humidity=curr["humidity"],
        wind_speed=curr["wind_speed"],
        pressure=curr["pressure"],
        sea_surface_temp=enso["sea_surface_temp"],
        sea_surface_anomaly=enso["sea_surface_anomaly"],
        outlook=enso["outlook"]
    )

@router.get("/current")
async def get_current_environment():
    return await WeatherService.get_current_environment()

@router.get("/enso")
def get_enso_status():
    return WeatherService.get_enso_summary()

@router.get("/history")
def get_environment_history():
    return {
        "sea_surface_temperature_trend": WeatherService.get_sea_surface_temp_history(),
        "enso_index_history": [
            {"month": "Dec", "oni": 1.1},
            {"month": "Jan", "oni": 1.2},
            {"month": "Feb", "oni": 1.3},
            {"month": "Mar", "oni": 1.4},
            {"month": "Apr", "oni": 1.4},
            {"month": "May", "oni": 1.4},
        ]
    }
