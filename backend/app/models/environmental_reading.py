import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from app.core.database import Base

class EnvironmentalReading(Base):
    __tablename__ = "environmental_readings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    location = Column(String, default="Grid Substation Regional Area")
    ambient_temperature = Column(Float, default=32.7)
    humidity = Column(Float, default=63.0)
    pressure = Column(Float, default=1008.0) # hPa
    wind_speed = Column(Float, default=12.4) # km/h
    sea_surface_temp = Column(Float, default=29.1) # °C
    enso_status = Column(String, default="Active") # Active, Neutral, Inactive
    enso_intensity = Column(String, default="Moderate to Strong")
    oni = Column(Float, default=1.4) # Oceanic Niño Index
    nino34 = Column(Float, default=28.8)
    condition = Column(String, default="Clear Sky")
    source = Column(String, default="NOAA / Open-Meteo Environmental Service")
