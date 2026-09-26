import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from app.core.database import Base

class HealthScore(Base):
    __tablename__ = "health_scores"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    transformer_id = Column(String, ForeignKey("transformers.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    health_score = Column(Float, nullable=False) # e.g. 87.0
    status = Column(String, default="Normal") # Normal, Warning, Critical
    trend = Column(String, default="stable") # stable, degrading, improving
