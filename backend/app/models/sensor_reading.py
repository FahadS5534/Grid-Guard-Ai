import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from app.core.database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    transformer_id = Column(String, ForeignKey("transformers.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    temperature = Column(Float, nullable=False) # °C
    ambient_temperature = Column(Float, default=32.7) # °C
    humidity = Column(Float, nullable=False) # %
    vibration = Column(Float, nullable=False) # mm/s
    current = Column(Float, nullable=False) # A (Load current)
    voltage = Column(Float, default=230.0) # V
    load = Column(Float, nullable=True) # A or kW
    power_factor = Column(Float, default=0.95)

    __table_args__ = (
        Index('idx_transformer_timestamp', 'transformer_id', 'timestamp'),
    )
