from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransformerBase(BaseModel):
    transformer_code: str
    name: str
    location: str
    capacity: str = "100 MVA"
    installation_date: str = "2020-01-15"
    status: str = "Normal"

class TransformerCreate(TransformerBase):
    pass

class TransformerUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[str] = None
    status: Optional[str] = None

class TransformerResponse(TransformerBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
