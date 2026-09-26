from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RecommendedAction(BaseModel):
    action: str
    priority: str = "WARNING" # CHECK, WARNING, CRITICAL

class MaintenanceResponse(BaseModel):
    id: Optional[str] = None
    transformer_id: str
    timestamp: datetime
    health_score: float = 87.0
    anomaly_score: float = 0.15
    reconstruction_error: float = 0.0825
    risk_category: str = "LOW" # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    risk_level: str = "Low Risk" # "Low Risk", "Moderate Risk", "High Risk", "Critical Risk"
    risk_score: float = 13.0 # percentage 0-100
    is_anomaly: bool = False
    recommended_actions: List[str]
    reasons: List[str]
    suggested_timeframe: str = "Within 3 Days"
    is_resolved: bool = False

    class Config:
        from_attributes = True
