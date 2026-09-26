import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.core.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    report_type = Column(String, nullable=False) # DAILY, WEEKLY, MONTHLY, CUSTOM
    date_range = Column(String, nullable=False) # e.g. "May 25, 2025" or "May 19 - May 25, 2025"
    file_format = Column(String, default="pdf") # pdf, csv, json
    file_path = Column(String, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)
