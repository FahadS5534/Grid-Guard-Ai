from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class AnomalyResultResponse(BaseModel):
    id: Optional[str] = None
    transformer_id: str
    timestamp: datetime
    anomaly_score: float
    reconstruction_error: float
    threshold: float = 0.243166
    is_anomaly: bool
    status: str # "Normal" or "High Anomaly"
    health_score: float = 87.0
    risk_category: str = "LOW" # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    temperature_deviation: Optional[float] = 0.0
    explanation: Optional[str] = None
    raw_features: Optional[Dict[str, float]] = None

    class Config:
        from_attributes = True

class ReconstructionPoint(BaseModel):
    x: Optional[int] = None
    timestamp: Optional[str] = None
    value: float
    is_anomaly: bool

class AnomalyHistoryResponse(BaseModel):
    transformer_id: str
    current_result: AnomalyResultResponse
    model_status: str = "Autoencoder - Model is running normally"
    reconstruction_history: List[ReconstructionPoint] = []
