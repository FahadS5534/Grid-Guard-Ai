from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from app.core.database import get_db
from app.models.transformer import Transformer
from app.models.sensor_reading import SensorReading
from app.models.health_score import HealthScore
from app.models.alert import Alert
from app.services.ml_service import get_ml_service
from app.schemas.dashboard import DashboardSummaryResponse, HealthTrendPoint

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    transformer_id: Optional[str] = Query(default=None),
    range: str = Query(default="7 Days"),
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
    
    if not tx:
        now = datetime.utcnow()
        return DashboardSummaryResponse(
            transformer_id="TX-101",
            transformer_name="Main Substation Transformer",
            status="Normal",
            health_score=87.0,
            risk_category="LOW",
            anomaly_score=0.13,
            reconstruction_error=0.0825,
            is_anomaly=False,
            last_updated=now.strftime("%I:%M %p\n%b %d, %Y"),
            temperature=68.4,
            vibration=2.35,
            load_current=156.8,
            humidity=54.0,
            voltage=230.0,
            health_trend=[],
            active_alerts_count=0
        )

    # Get latest sensor reading
    latest_reading = (
        db.query(SensorReading)
        .filter(SensorReading.transformer_id == tx.id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )

    temp = latest_reading.temperature if latest_reading else 68.4
    vib = latest_reading.vibration if latest_reading else 2.35
    curr = latest_reading.current if latest_reading else 156.8
    hum = latest_reading.humidity if latest_reading else 54.0
    volt = latest_reading.voltage if latest_reading else 230.0

    # Execute ML inference adapter
    ml_service = get_ml_service()
    pred = ml_service.predict({
        "temperature": temp,
        "vibration": vib,
        "current": curr,
        "voltage": volt,
        "ambient_temperature": 32.7
    })

    # Count active alerts
    alerts_count = (
        db.query(Alert)
        .filter(Alert.transformer_id == tx.id, Alert.acknowledged == False)
        .count()
    )

    # Build health trend based on range cutoff
    days = 7
    if range == "24 Hours":
        days = 1
    elif range == "30 Days":
        days = 30
    elif range == "90 Days":
        days = 90

    cutoff = datetime.utcnow() - timedelta(days=days)
    health_history = (
        db.query(HealthScore)
        .filter(HealthScore.transformer_id == tx.id, HealthScore.timestamp >= cutoff)
        .order_by(HealthScore.timestamp.asc())
        .all()
    )

    trend_points = []
    if health_history:
        for h in health_history:
            label = h.timestamp.strftime("%b %d" if days > 1 else "%H:%M")
            trend_points.append(HealthTrendPoint(
                timestamp=h.timestamp.isoformat(),
                date_label=label,
                health_score=h.health_score
            ))

    last_up = latest_reading.timestamp.strftime("%I:%M %p\n%b %d, %Y") if latest_reading else "10:24 AM\nMay 25, 2025"

    return DashboardSummaryResponse(
        transformer_id=tx.transformer_code,
        transformer_name=tx.name,
        status=tx.status,
        health_score=pred["health_score"],
        risk_category=pred.get("risk_category", "LOW"),
        anomaly_score=pred["anomaly_score"],
        reconstruction_error=pred["reconstruction_error"],
        is_anomaly=pred["is_anomaly"],
        last_updated=last_up,
        temperature=temp,
        vibration=vib,
        load_current=curr,
        humidity=hum,
        voltage=volt,
        health_trend=trend_points,
        active_alerts_count=alerts_count
    )
