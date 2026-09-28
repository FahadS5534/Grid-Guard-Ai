from fastapi import APIRouter
from app.services.weather_service import WeatherService
from app.schemas.environment import EnvironmentSummary

router = APIRouter(prefix="/environment", tags=["Environmental & El Niño Monitor"])

@router.get("/summary", response_model=EnvironmentSummary)
async def get_environment_summary():
    curr = await WeatherService.get_current_environment()
    enso = WeatherService.get_enso_summary()
    desc = enso.get("intensity", enso.get("description", "Moderate to Strong El Niño conditions observed across the Pacific Equatorial zone."))
    return EnvironmentSummary(
        status=enso.get("status", "Active El Niño"),
        intensity=desc,
        description=desc,
        current_temp=curr.get("ambient_temperature", 32.7),
        humidity=curr.get("humidity", 63.0),
        wind_speed=curr.get("wind_speed", 12.4),
        pressure=curr.get("pressure", 1008.0),
        sea_surface_temp=enso.get("sea_surface_temp", 29.1),
        sea_surface_anomaly=enso.get("sea_surface_anomaly", "+1.4°C"),
        oni=enso.get("oni", 1.4),
        period=enso.get("period", "2026-01 (DJF)"),
        source=enso.get("source", "NOAA Climate Prediction Center (CPC) Oceanic Niño Index (ONI) Dataset"),
        outlook=enso.get("outlook", "El Niño conditions provide environmental context for the transformer monitoring period.")
    )

@router.get("/current")
async def get_current_environment():
    return await WeatherService.get_current_environment()

@router.get("/enso")
def get_enso_status():
    return WeatherService.get_enso_summary()

@router.get("/oni")
def get_oni_latest():
    return WeatherService.get_enso_summary()

@router.get("/oni/history")
def get_oni_history():
    return {
        "summary": WeatherService.get_enso_summary(),
        "oni_history": WeatherService.get_oni_dataset_history(),
        "sea_surface_temperature_trend": WeatherService.get_sea_surface_temp_history()
    }

@router.get("/history")
def get_environment_history():
    return {
        "summary": WeatherService.get_enso_summary(),
        "oni_history": WeatherService.get_oni_dataset_history(),
        "sea_surface_temperature_trend": WeatherService.get_sea_surface_temp_history()
    }
