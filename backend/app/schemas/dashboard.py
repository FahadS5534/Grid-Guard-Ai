from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class HealthTrendPoint(BaseModel):
    timestamp: str
    date_label: str
    health_score: float

class DashboardSummaryResponse(BaseModel):
    transformer_id: str
    transformer_name: str
    status: str # "Normal", "Warning", "Critical"
    health_score: float # e.g. 87.0
    risk_category: str = "LOW" # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    anomaly_score: float = 0.13
    reconstruction_error: float = 0.0825
    is_anomaly: bool = False
    last_updated: str # e.g. "10:24 AM \nMay 25, 2025"
    temperature: float # 68.4
    vibration: float # 2.35
    load_current: float # 156.8
    humidity: float # 54
    voltage: float = 230.0
    health_trend: List[HealthTrendPoint] = []
    active_alerts_count: int = 0
