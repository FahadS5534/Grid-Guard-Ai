import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, JSON
from app.core.database import Base

class MaintenanceRecommendation(Base):
    __tablename__ = "maintenance_recommendations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    transformer_id = Column(String, ForeignKey("transformers.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    risk_level = Column(String, default="High Risk") # Low Risk, Moderate Risk, High Risk, Critical
    risk_score = Column(Float, default=78.0) # percentage 0-100
    recommended_actions = Column(JSON, nullable=False) # list of strings
    reasons = Column(JSON, nullable=False) # list of reasons
    suggested_timeframe = Column(String, default="Within 3 Days")
    is_resolved = Column(Boolean, default=False)
