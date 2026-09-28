from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timedelta
import csv
import io

from app.core.database import get_db
from app.models.transformer import Transformer
from app.models.sensor_reading import SensorReading
from app.services.ml_service import get_ml_service
from app.services.maintenance_service import MaintenanceRecommendationService

router = APIRouter(prefix="/simulation", tags=["Data Simulation & Scenario Testing"])

class SimulationInjectPayload(BaseModel):
    transformer_id: str = "TX-101"
    temperature: float = Field(..., ge=-40.0, le=150.0, description="Transformer temperature °C")
    current: float = Field(..., ge=0.0, le=1000.0, description="Load current Amperes")
    voltage: float = Field(..., ge=0.0, le=500.0, description="Grid voltage Volts")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Ambient humidity %")
    vibration: float = Field(..., ge=0.0, le=50.0, description="Mechanical vibration mm/s")
    timestamp: Optional[datetime] = None

class ScenarioRequest(BaseModel):
    transformer_id: str = "TX-101"
    scenario_type: str = Field("normal", description="normal | thermal_stress | electrical_anomaly | combined_stress")
    base_temperature: float = 68.4
    base_current: float = 156.8
    base_voltage: float = 230.0
    base_humidity: float = 54.0
    base_vibration: float = 2.35

@router.post("/inject")
def inject_simulated_telemetry(payload: SimulationInjectPayload, db: Session = Depends(get_db)):
    """
    Injects a single simulated sensor reading into the system without connecting ESP32 hardware.
    Values are explicitly stored as simulated test data.
    """
    tx = db.query(Transformer).filter(
        (Transformer.transformer_code == payload.transformer_id) | (Transformer.id == payload.transformer_id)
    ).first()

    if not tx:
        tx = Transformer(
            transformer_code=payload.transformer_id,
            name=f"Transformer {payload.transformer_id}",
            location="Main Substation Bay 1",
            capacity="100 MVA",
            status="Normal"
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)

    ts = payload.timestamp or datetime.utcnow()

    # Save Sensor Reading marked as simulated
    reading = SensorReading(
        transformer_id=tx.id,
        timestamp=ts,
        temperature=payload.temperature,
        ambient_temperature=32.7,
        humidity=payload.humidity,
        vibration=payload.vibration,
        current=payload.current,
        voltage=payload.voltage,
        load=payload.current,
        power_factor=0.95
    )
    db.add(reading)
    db.commit()

    # Fetch last 96 sensor readings to form sequence
    recent_readings = (
        db.query(SensorReading)
        .filter(SensorReading.transformer_id == tx.id)
        .order_by(SensorReading.timestamp.asc())
        .limit(96)
        .all()
    )

    obs_count = len(recent_readings)
    obs_list = [
        {
            "temperature": r.temperature,
            "current": r.current,
            "voltage": r.voltage,
            "humidity": r.humidity,
            "vibration": r.vibration,
            "timestamp": r.timestamp.isoformat()
        } for r in recent_readings
    ]

    ml_service = get_ml_service()
    ml_result = ml_service.predict_sequence(obs_list, current_time=ts)

    maint_eval = MaintenanceRecommendationService.evaluate(
        sensor_data={"temperature": payload.temperature, "vibration": payload.vibration, "current": payload.current, "voltage": payload.voltage},
        thermal_stress=0.65 if payload.temperature > 65 else 0.25,
        is_anomaly=ml_result["is_anomaly"],
        health_score=ml_result["health_score"],
        reconstruction_error=ml_result["reconstruction_error"],
        threshold=ml_result["threshold"],
        dominant_signal=ml_result["dominant_signal"]
    )

    return {
        "status": "success",
        "data_mode": "SIMULATED",
        "notice": f"AI inference requires 96 observations (24 hours at 15-minute intervals). Currently available: {obs_count}/96 observations.",
        "observation_count": obs_count,
        "latest_injected": {
            "temperature": payload.temperature,
            "current": payload.current,
            "voltage": payload.voltage,
            "humidity": payload.humidity,
            "vibration": payload.vibration,
            "timestamp": ts.isoformat()
        },
        "ml_result": ml_result,
        "recommendation": maint_eval
    }

@router.post("/sequence")
def generate_and_evaluate_sequence(req: ScenarioRequest):
    """
    Generates a full 96-observation sequence (24 hours at 15-minute intervals) for a demo scenario
    and evaluates it using the frozen LSTM Autoencoder.
    """
    import random

    scen = req.scenario_type.lower()
    base_t = req.base_temperature
    base_c = req.base_current
    base_v = req.base_voltage

    if scen == "thermal_stress":
        base_t = max(base_t, 82.5)
    elif scen == "electrical_anomaly":
        base_c = max(base_c, 245.0)
        base_v = 195.0
    elif scen == "combined_stress":
        base_t = max(base_t, 88.0)
        base_c = max(base_c, 260.0)
        base_v = 188.0

    now = datetime.utcnow()
    start_time = now - timedelta(hours=24)
    sequence = []

    for i in range(96):
        step_time = start_time + timedelta(minutes=15 * i)
        noise_t = random.uniform(-1.2, 1.5)
        noise_c = random.uniform(-3.0, 4.0)
        noise_v = random.uniform(-2.0, 2.0)

        # Add escalation trend toward later timesteps if anomalous scenario
        trend_factor = (i / 95.0) if scen != "normal" else 0.0

        t = round(base_t + (15.0 * trend_factor if scen in ["thermal_stress", "combined_stress"] else 0.0) + noise_t, 1)
        c = round(base_c + (50.0 * trend_factor if scen in ["electrical_anomaly", "combined_stress"] else 0.0) + noise_c, 1)
        v = round(base_v - (15.0 * trend_factor if scen in ["electrical_anomaly", "combined_stress"] else 0.0) + noise_v, 1)
        h = round(req.base_humidity + random.uniform(-2.0, 2.0), 0)
        vib = round(req.base_vibration + (1.2 * trend_factor if scen != "normal" else 0.0) + random.uniform(-0.1, 0.1), 2)

        sequence.append({
            "step": i + 1,
            "timestamp": step_time.strftime("%H:%M"),
            "full_timestamp": step_time.isoformat(),
            "temperature": t,
            "current": c,
            "voltage": v,
            "humidity": h,
            "vibration": vib
        })

    ml_service = get_ml_service()
    ml_result = ml_service.predict_sequence(sequence, current_time=now)

    maint_eval = MaintenanceRecommendationService.evaluate(
        sensor_data=sequence[-1],
        thermal_stress=0.85 if scen in ["thermal_stress", "combined_stress"] else 0.25,
        is_anomaly=ml_result["is_anomaly"],
        health_score=ml_result["health_score"],
        reconstruction_error=ml_result["reconstruction_error"],
        threshold=ml_result["threshold"],
        dominant_signal=ml_result["dominant_signal"]
    )

    return {
        "scenario_type": scen.upper(),
        "data_mode": "SIMULATED SCENARIO",
        "notice": "AI inference requires 96 observations (24 hours at 15-minute intervals). Sequence generated successfully.",
        "observation_count": len(sequence),
        "window_start": sequence[0]["full_timestamp"],
        "window_end": sequence[-1]["full_timestamp"],
        "sequence": sequence,
        "ml_result": ml_result,
        "recommendation": maint_eval
    }

@router.post("/csv-upload")
async def evaluate_csv_sequence(file: UploadFile = File(...)):
    """
    Evaluates a 96-row sequence uploaded via CSV file against the frozen LSTM Autoencoder.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a .csv file")

    content = await file.read()
    text = content.decode("utf-8")

    reader = csv.DictReader(io.StringIO(text))
    rows = list(reader)

    if len(rows) == 0:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty")

    obs_list = []
    for idx, row in enumerate(rows, 1):
        try:
            t = float(row.get("temperature", row.get("temp", 68.4)))
            c = float(row.get("current", 156.8))
            v = float(row.get("voltage", 230.0))
            h = float(row.get("humidity", 54.0))
            vib = float(row.get("vibration", 2.35))
            obs_list.append({"temperature": t, "current": c, "voltage": v, "humidity": h, "vibration": vib})
        except ValueError:
            raise HTTPException(status_code=422, detail=f"Invalid numeric data on row {idx} in CSV file")

    ml_service = get_ml_service()
    ml_result = ml_service.predict_sequence(obs_list)

    maint_eval = MaintenanceRecommendationService.evaluate(
        sensor_data=obs_list[-1],
        thermal_stress=0.65 if obs_list[-1]["temperature"] > 65 else 0.25,
        is_anomaly=ml_result["is_anomaly"],
        health_score=ml_result["health_score"],
        reconstruction_error=ml_result["reconstruction_error"],
        threshold=ml_result["threshold"],
        dominant_signal=ml_result["dominant_signal"]
    )

    return {
        "filename": file.filename,
        "data_mode": "SIMULATED CSV UPLOAD",
        "notice": f"Parsed {len(rows)} observations from CSV file.",
        "observation_count": len(obs_list),
        "ml_result": ml_result,
        "recommendation": maint_eval
    }
