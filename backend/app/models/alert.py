import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    transformer_id = Column(String, ForeignKey("transformers.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    alert_type = Column(String, nullable=False) # HIGH_TEMPERATURE, HIGH_VIBRATION, HIGH_THERMAL_STRESS, ANOMALY_DETECTED, SYSTEM_NORMAL
    severity = Column(String, nullable=False) # CRITICAL, HIGH, WARNING, INFO
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)
