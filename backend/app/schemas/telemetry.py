from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TelemetryPayload(BaseModel):
    transformer_id: str = Field(..., description="Transformer code or UUID (e.g. TX-101)")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    temperature: float = Field(..., description="Transformer surface/oil temperature in °C")
    ambient_temperature: Optional[float] = Field(default=32.7, description="Ambient temperature in °C")
    humidity: float = Field(..., description="Relative humidity in %")
    vibration: float = Field(..., description="Vibration level in mm/s")
    current: float = Field(..., description="Load current in Amperes")
    voltage: Optional[float] = Field(default=230.0, description="Line voltage in Volts")
    load: Optional[float] = Field(default=None, description="Current load reading")
    power_factor: Optional[float] = Field(default=0.95)

class TelemetryResponse(TelemetryPayload):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TelemetryHistoryQuery(BaseModel):
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
    interval: Optional[str] = "5m"
    limit: int = 100
    offset: int = 0
