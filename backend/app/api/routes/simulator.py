from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.simulator_service import DevelopmentSimulatorService

router = APIRouter(prefix="/dev", tags=["Development Simulator"])

@router.post("/simulate")
def trigger_simulation_tick(
    transformer_id: str = Query(default="TX-101"),
    db: Session = Depends(get_db)
):
    """
    Manually triggers a development simulator telemetry tick.
    Produces realistic noisy sensor data, computes thermal stress,
    runs ML mock inference, evaluates rules, and records alerts.
    """
    result = DevelopmentSimulatorService.generate_tick(db, transformer_id)
    return {"success": True, "data": result}
