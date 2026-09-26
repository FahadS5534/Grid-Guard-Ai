from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.models.transformer import Transformer
from app.models.sensor_reading import SensorReading
from app.models.maintenance import MaintenanceRecommendation
from app.services.ml_service import get_ml_service
from app.services.maintenance_service import MaintenanceRecommendationService
from app.schemas.maintenance import MaintenanceResponse

router = APIRouter(prefix="/maintenance", tags=["Predictive Maintenance"])

@router.get("", response_model=MaintenanceResponse)
def get_predictive_maintenance(
    transformer_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    tx = None
    if transformer_id:
        tx = (
            db.query(Transformer)
            .filter((Transformer.id == transformer_id) | (Transformer.transformer_code == transformer_id))
            .first()
        )
    if not tx:
        tx = db.query(Transformer).first()

    latest_sensor = None
    if tx:
        latest_sensor = (
            db.query(SensorReading)
            .filter(SensorReading.transformer_id == tx.id)
            .order_by(SensorReading.timestamp.desc())
            .first()
        )

    temp = latest_sensor.temperature if latest_sensor else 68.4
    vib = latest_sensor.vibration if latest_sensor else 2.35
    curr = latest_sensor.current if latest_sensor else 156.8
    volt = latest_sensor.voltage if latest_sensor else 230.0

    # Get real ML prediction
    ml_service = get_ml_service()
    pred = ml_service.predict({
        "temperature": temp,
        "vibration": vib,
        "current": curr,
        "voltage": volt,
        "ambient_temperature": 32.7
    })

    # Rule evaluation
    maint_eval = MaintenanceRecommendationService.evaluate(
        sensor_data={"temperature": temp, "vibration": vib, "current": curr, "voltage": volt},
        thermal_stress=0.78,
        is_anomaly=pred["is_anomaly"],
        health_score=pred["health_score"]
    )

    risk_score = round(min(100.0, max(0.0, (1.0 - (pred["health_score"] / 100.0)) * 100.0)), 0)

    return MaintenanceResponse(
        transformer_id=tx.transformer_code if tx else "TX-101",
        timestamp=latest_sensor.timestamp if latest_sensor else datetime.utcnow(),
        health_score=pred["health_score"],
        anomaly_score=pred["anomaly_score"],
        reconstruction_error=pred["reconstruction_error"],
        risk_category=pred.get("risk_category", "LOW"),
        risk_level=f"{pred.get('risk_category', 'LOW').title()} Risk",
        risk_score=risk_score,
        is_anomaly=pred["is_anomaly"],
        recommended_actions=maint_eval["recommended_actions"],
        reasons=maint_eval["reasons"],
        suggested_timeframe=maint_eval["suggested_timeframe"],
        is_resolved=False
    )
