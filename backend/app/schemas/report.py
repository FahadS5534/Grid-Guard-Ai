from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    title: str
    report_type: str # DAILY, WEEKLY, MONTHLY, CUSTOM
    from_date: Optional[str] = None
    to_date: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    title: str
    report_type: str
    date_range: str
    file_format: str
    file_path: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True
