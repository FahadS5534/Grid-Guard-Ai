import random
from datetime import datetime
from sqlalchemy.orm import Session
from app.schemas.telemetry import TelemetryPayload
from app.services.telemetry_service import TelemetryService
from app.core.config import settings

class DevelopmentSimulatorService:
    """
    Simulates realistic IoT sensor streams for development and demo purposes.
    Produces slight variations around baseline transformer parameter values.
    """

    @staticmethod
    def generate_tick(db: Session, transformer_id: str = "TX-101") -> dict:
        if not settings.SIMULATOR_ENABLED:
            return {"status": "Simulator is disabled in settings."}

        # Add realistic noise/fluctuations matching mockup ranges
        temp = round(68.4 + random.uniform(-1.5, 2.2), 1)
        vib = round(2.35 + random.uniform(-0.15, 0.20), 2)
        curr = round(156.8 + random.uniform(-3.5, 4.5), 1)
        humidity = round(54.0 + random.uniform(-2.0, 3.0), 0)
        ambient = round(32.7 + random.uniform(-0.5, 0.8), 1)

        payload = TelemetryPayload(
            transformer_id=transformer_id,
            timestamp=datetime.utcnow(),
            temperature=temp,
            ambient_temperature=ambient,
            humidity=humidity,
            vibration=vib,
            current=curr,
            voltage=230.0 + random.uniform(-2.0, 2.0),
            load=curr,
            power_factor=0.95
        )

        result = TelemetryService.process_telemetry(db, payload)
        result["is_simulated"] = True
        return result
