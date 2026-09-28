from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EnvironmentReadingBase(BaseModel):
    ambient_temperature: float = 32.7
    humidity: float = 63.0
    pressure: float = 1008.0
    wind_speed: float = 12.4
    sea_surface_temp: float = 29.1
    enso_status: str = "Active"
    enso_intensity: str = "Moderate to Strong"
    oni: float = 1.4
    nino34: float = 28.8
    condition: str = "Clear Sky"
    source: str = "NOAA / Open-Meteo Environmental Service"

class EnvironmentReadingResponse(EnvironmentReadingBase):
    id: str
    timestamp: datetime
    location: str

    class Config:
        from_attributes = True

class EnvironmentSummary(BaseModel):
    status: str = "Active El Niño"
    intensity: str = "Moderate to Strong El Niño conditions observed across the Pacific Equatorial zone."
    description: str = "Moderate to Strong El Niño conditions observed across the Pacific Equatorial zone."
    current_temp: float = 32.7
    humidity: float = 63.0
    wind_speed: float = 12.4
    pressure: float = 1008.0
    sea_surface_temp: float = 29.1
    sea_surface_anomaly: str = "+1.4°C"
    oni: float = 1.4
    period: str = "2026-01 (DJF)"
    source: str = "NOAA Climate Prediction Center (CPC) Oceanic Niño Index (ONI) Dataset"
    outlook: str = "El Niño conditions provide environmental context for the transformer monitoring period."
