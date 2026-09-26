import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, JSON
from app.core.database import Base

class AnomalyResult(Base):
    __tablename__ = "anomaly_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    transformer_id = Column(String, ForeignKey("transformers.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    anomaly_score = Column(Float, nullable=False) # 0.00 to 1.00
    reconstruction_error = Column(Float, nullable=False)
    threshold = Column(Float, default=0.243166)
    is_anomaly = Column(Boolean, default=False)
    status = Column(String, default="Normal") # Normal, High Anomaly
    explanation = Column(String, nullable=True)
    raw_features = Column(JSON, nullable=True)
