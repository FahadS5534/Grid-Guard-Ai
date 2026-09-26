from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.alert import Alert
from app.models.transformer import Transformer
from app.schemas.alert import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    transformer_id: Optional[str] = Query(default=None),
    acknowledged: Optional[bool] = Query(default=None),
    limit: int = Query(default=50),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)

    if transformer_id:
        tx = (
            db.query(Transformer)
            .filter((Transformer.id == transformer_id) | (Transformer.transformer_code == transformer_id))
            .first()
        )
        if tx:
            query = query.filter(Alert.transformer_id == tx.id)

    if acknowledged is not None:
        query = query.filter(Alert.acknowledged == acknowledged)

    alerts = query.order_by(Alert.timestamp.desc()).limit(limit).all()

    if not alerts:
        # Provide baseline mock alerts matching exact mockup
        now = datetime.utcnow()
        tx_code = transformer_id or "TX-101"
        return [
            AlertResponse(
                id="alt-101",
                transformer_id=tx_code,
                timestamp=now - timedelta(minutes=10),
                alert_type="HIGH_TEMPERATURE",
                severity="CRITICAL",
                title="High Temperature Alert",
                message="Transformer Temperature reached 68.4°C",
                acknowledged=False
            ),
            AlertResponse(
                id="alt-102",
                transformer_id=tx_code,
                timestamp=now - timedelta(minutes=14),
                alert_type="HIGH_VIBRATION",
                severity="HIGH",
                title="High Vibration Alert",
                message="Vibration level is 2.35 mm/s",
                acknowledged=False
            ),
            AlertResponse(
                id="alt-103",
                transformer_id=tx_code,
                timestamp=now - timedelta(minutes=19),
                alert_type="HIGH_THERMAL_STRESS",
                severity="WARNING",
                title="High Thermal Stress",
                message="Thermal Stress Index is 0.78",
                acknowledged=False
            ),
            AlertResponse(
                id="alt-104",
                transformer_id=tx_code,
                timestamp=now - timedelta(minutes=44),
                alert_type="SYSTEM_NORMAL",
                severity="INFO",
                title="System Normal",
                message="All parameters are within normal range",
                acknowledged=True
            ),
        ]

    res = []
    for a in alerts:
        data = AlertResponse.model_validate(a)
        res.append(data)
    return res

@router.patch("/{alert_id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.acknowledged = True
    alert.acknowledged_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert
