from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.schemas.telemetry import TelemetryPayload, TelemetryResponse
from app.services.telemetry_service import TelemetryService
from app.models.sensor_reading import SensorReading
from app.models.transformer import Transformer

router = APIRouter(tags=["Telemetry Ingestion & History"])

@router.post("/telemetry")
def ingest_telemetry(payload: TelemetryPayload, db: Session = Depends(get_db)):
    """
    ESP32 Hardware & Development Simulator Software Ingestion Endpoint.
    Validates payload using Pydantic, calculates thermal stress, triggers ML inference,
    updates health score, evaluates maintenance recommendations, and emits alerts.
    """
    result = TelemetryService.process_telemetry(db, payload)
    return {"success": True, "data": result}

@router.get("/transformers/{transformer_id}/telemetry", response_model=List[TelemetryResponse])
def get_telemetry_history(
    transformer_id: str,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    tx = (
        db.query(Transformer)
        .filter((Transformer.id == transformer_id) | (Transformer.transformer_code == transformer_id))
        .first()
    )
    if not tx:
        return []

    query = db.query(SensorReading).filter(SensorReading.transformer_id == tx.id)
    if from_date:
        query = query.filter(SensorReading.timestamp >= from_date)
    if to_date:
        query = query.filter(SensorReading.timestamp <= to_date)

    readings = query.order_by(SensorReading.timestamp.desc()).offset(offset).limit(limit).all()
    
    # Map back transformer_code into response
    res = []
    for r in readings:
        data = TelemetryResponse.model_validate(r)
        data.transformer_id = tx.transformer_code
        res.append(data)
    return res
