from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.alert import Alert
from typing import Dict, Any, Optional

class AlertService:
    """
    Evaluates incoming telemetry & health metrics to generate alerts.
    Includes deduplication & cooldown mechanism to prevent spam.
    """

    @staticmethod
    def process_telemetry_alerts(
        db: Session,
        transformer_id: str,
        sensor_data: Dict[str, float],
        thermal_stress: float,
        is_anomaly: bool
    ) -> Optional[Alert]:
        temp = sensor_data.get("temperature", 68.4)
        vibration = sensor_data.get("vibration", 2.35)

        # Check latest unacknowledged alert for this transformer within last 15 minutes (cooldown window)
        fifteen_mins_ago = datetime.utcnow() - timedelta(minutes=15)
        
        # Determine candidate alert
        candidate_type = None
        severity = "INFO"
        title = ""
        message = ""

        if temp >= 68.0:
            candidate_type = "HIGH_TEMPERATURE"
            severity = "CRITICAL"
            title = "High Temperature Alert"
            message = f"Transformer Temperature reached {temp}°C"
        elif vibration >= 2.30:
            candidate_type = "HIGH_VIBRATION"
            severity = "HIGH"
            title = "High Vibration Alert"
            message = f"Vibration level is {vibration} mm/s"
        elif thermal_stress >= 0.70:
            candidate_type = "HIGH_THERMAL_STRESS"
            severity = "WARNING"
            title = "High Thermal Stress"
            message = f"Thermal Stress Index is {thermal_stress}"
        elif is_anomaly:
            candidate_type = "ANOMALY_DETECTED"
            severity = "CRITICAL"
            title = "AI Anomaly Detected"
            message = "Autoencoder detected unusual sensor patterns."

        if not candidate_type:
            return None

        # Check existing alert for deduplication
        existing = (
            db.query(Alert)
            .filter(
                Alert.transformer_id == transformer_id,
                Alert.alert_type == candidate_type,
                Alert.acknowledged == False,
                Alert.timestamp >= fifteen_mins_ago
            )
            .first()
        )

        if existing:
            # Skip creating duplicate alert during cooldown
            return existing

        # Create new alert
        alert = Alert(
            transformer_id=transformer_id,
            alert_type=candidate_type,
            severity=severity,
            title=title,
            message=message,
            timestamp=datetime.utcnow(),
            acknowledged=False
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert
