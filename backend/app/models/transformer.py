import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from app.core.database import Base

class Transformer(Base):
    __tablename__ = "transformers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    transformer_code = Column(String, unique=True, index=True, nullable=False) # e.g. TX-101
    name = Column(String, nullable=False) # e.g. Main Substation Transformer
    location = Column(String, nullable=False) # e.g. North Substation - Bay 4
    capacity = Column(String, default="100 MVA")
    installation_date = Column(String, default="2020-01-15")
    status = Column(String, default="Normal") # Normal, Warning, Critical
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
