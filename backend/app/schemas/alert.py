from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    transformer_id: str
    alert_type: str
    severity: str
    title: str
    message: str

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: str
    timestamp: datetime
    acknowledged: bool
    acknowledged_at: Optional[datetime] = None

    class Config:
        from_attributes = True
