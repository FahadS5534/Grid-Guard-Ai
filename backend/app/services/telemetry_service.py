from datetime import datetime
from sqlalchemy.orm import Session
from app.models.transformer import Transformer
from app.models.sensor_reading import SensorReading
from app.models.health_score import HealthScore
from app.models.anomaly_result import AnomalyResult
from app.models.maintenance import MaintenanceRecommendation
from app.schemas.telemetry import TelemetryPayload
from app.services.thermal_stress_service import ThermalStressService
from app.services.ml_service import get_ml_service
from app.services.maintenance_service import MaintenanceRecommendationService
from app.services.alert_service import AlertService
from typing import Dict, Any

class TelemetryService:
    @staticmethod
    def process_telemetry(db: Session, payload: TelemetryPayload) -> Dict[str, Any]:
        # 1. Resolve transformer by code or id
        transformer = (
            db.query(Transformer)
            .filter(
                (Transformer.transformer_code == payload.transformer_id) |
                (Transformer.id == payload.transformer_id)
            )
            .first()
        )

        if not transformer:
            # Create transformer if it doesn't exist yet
            transformer = Transformer(
                transformer_code=payload.transformer_id,
                name=f"Transformer {payload.transformer_id}",
                location="Main Substation Bay 1",
                capacity="100 MVA",
                status="Normal"
            )
            db.add(transformer)
            db.commit()
            db.refresh(transformer)

        timestamp = payload.timestamp or datetime.utcnow()
        ambient_temp = payload.ambient_temperature or 32.7

        # 2. Store Sensor Reading
        reading = SensorReading(
            transformer_id=transformer.id,
            timestamp=timestamp,
            temperature=payload.temperature,
            ambient_temperature=ambient_temp,
            humidity=payload.humidity,
            vibration=payload.vibration,
            current=payload.current,
            voltage=payload.voltage or 230.0,
            load=payload.load or payload.current,
            power_factor=payload.power_factor or 0.95
        )
        db.add(reading)
        db.commit()

        # 3. Calculate Thermal Stress
        temp_rise = ThermalStressService.calculate_temperature_rise(payload.temperature, ambient_temp)
        stress_index = ThermalStressService.calculate_stress_index(payload.temperature, ambient_temp)
        stress_level = ThermalStressService.get_stress_level(stress_index)

        # 4. Invoke ML Inference Adapter
        sensor_dict = {
            "temperature": payload.temperature,
            "ambient_temperature": ambient_temp,
            "humidity": payload.humidity,
            "vibration": payload.vibration,
            "current": payload.current,
            "voltage": payload.voltage or 230.0
        }
        ml_service = get_ml_service()
        ml_result = ml_service.predict(sensor_dict)

        # Save Anomaly Result
        anomaly_rec = AnomalyResult(
            transformer_id=transformer.id,
            timestamp=timestamp,
            anomaly_score=ml_result["anomaly_score"],
            reconstruction_error=ml_result["reconstruction_error"],
            threshold=ml_result["threshold"],
            is_anomaly=ml_result["is_anomaly"],
            status=ml_result["status"],
            explanation=ml_result["explanation"],
            raw_features=sensor_dict
        )
        db.add(anomaly_rec)

        # Save Health Score
        health_rec = HealthScore(
            transformer_id=transformer.id,
            timestamp=timestamp,
            health_score=ml_result["health_score"],
            status="Warning" if ml_result["health_score"] < 75 else "Normal",
            trend="degrading" if ml_result["is_anomaly"] else "stable"
        )
        db.add(health_rec)

        # 5. Evaluate Maintenance Recommendations
        maint_eval = MaintenanceRecommendationService.evaluate(
            sensor_data=sensor_dict,
            thermal_stress=stress_index,
            is_anomaly=ml_result["is_anomaly"],
            health_score=ml_result["health_score"]
        )
        maint_rec = MaintenanceRecommendation(
            transformer_id=transformer.id,
            timestamp=timestamp,
            risk_level=maint_eval["risk_level"],
            risk_score=maint_eval["risk_score"],
            recommended_actions=maint_eval["recommended_actions"],
            reasons=maint_eval["reasons"],
            suggested_timeframe=maint_eval["suggested_timeframe"]
        )
        db.add(maint_rec)

        # Update transformer status
        if ml_result["health_score"] < 70 or ml_result["is_anomaly"]:
            transformer.status = "Warning" if ml_result["health_score"] > 50 else "Critical"
        else:
            transformer.status = "Normal"
        transformer.updated_at = timestamp

        db.commit()

        # 6. Evaluate and trigger Alerts
        AlertService.process_telemetry_alerts(
            db=db,
            transformer_id=transformer.id,
            sensor_data=sensor_dict,
            thermal_stress=stress_index,
            is_anomaly=ml_result["is_anomaly"]
        )

        return {
            "transformer_id": transformer.transformer_code,
            "timestamp": timestamp.isoformat(),
            "status": transformer.status,
            "health_score": ml_result["health_score"],
            "thermal_stress_index": stress_index,
            "thermal_stress_level": stress_level,
            "anomaly": ml_result
        }
