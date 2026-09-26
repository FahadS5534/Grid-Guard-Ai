import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models import (
    User, Transformer, SensorReading, EnvironmentalReading,
    HealthScore, AnomalyResult, MaintenanceRecommendation, Alert, Report
)
from app.core.security import get_password_hash

def seed_db():
    print("Initializing Database Schema & Seeding Initial Development Data...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Default Admin/Operator Users
        if not db.query(User).filter(User.email == "operator@gridguard.ai").first():
            op_user = User(
                email="operator@gridguard.ai",
                hashed_password=get_password_hash("gridguard123"),
                full_name="Grid Control Operator",
                role="OPERATOR"
            )
            admin_user = User(
                email="admin@gridguard.ai",
                hashed_password=get_password_hash("admin123"),
                full_name="Chief Grid Engineer",
                role="ADMIN"
            )
            db.add_all([op_user, admin_user])
            db.commit()

        # 2. Seed Initial Transformers
        if not db.query(Transformer).filter(Transformer.transformer_code == "TX-101").first():
            tx1 = Transformer(
                transformer_code="TX-101",
                name="Main Substation Transformer",
                location="North Substation - Bay 4",
                capacity="100 MVA",
                installation_date="2020-01-15",
                status="Normal"
            )
            tx2 = Transformer(
                transformer_code="TX-102",
                name="Auxiliary Power Transformer",
                location="East Substation - Bay 2",
                capacity="50 MVA",
                installation_date="2021-06-20",
                status="Normal"
            )
            db.add_all([tx1, tx2])
            db.commit()

        tx1 = db.query(Transformer).filter(Transformer.transformer_code == "TX-101").first()

        # 3. Seed Environmental Readings if empty
        if db.query(EnvironmentalReading).count() == 0:
            env = EnvironmentalReading(
                timestamp=datetime.utcnow(),
                location="Regional Substation Hub",
                ambient_temperature=32.7,
                humidity=63.0,
                pressure=1008.0,
                wind_speed=12.4,
                sea_surface_temp=29.1,
                enso_status="Active",
                enso_intensity="Moderate to Strong",
                oni=1.4,
                nino34=28.8,
                condition="Clear Sky"
            )
            db.add(env)
            db.commit()

        # 4. Seed Historical Telemetry Readings for past 7 days
        if db.query(SensorReading).filter(SensorReading.transformer_id == tx1.id).count() == 0:
            now = datetime.utcnow()
            for i in range(14, -1, -1):
                ts = now - timedelta(hours=i * 12)
                # Baseline curves matching mockup parameters
                temp = 68.4 if i == 0 else (64.0 + (i % 5) * 1.2)
                vib = 2.35 if i == 0 else (1.8 + (i % 3) * 0.2)
                curr = 156.8 if i == 0 else (145.0 + (i % 4) * 3.5)
                hum = 54.0 if i == 0 else (50.0 + (i % 6) * 1.5)

                reading = SensorReading(
                    transformer_id=tx1.id,
                    timestamp=ts,
                    temperature=temp,
                    ambient_temperature=32.7,
                    humidity=hum,
                    vibration=vib,
                    current=curr,
                    voltage=230.0,
                    load=curr,
                    power_factor=0.95
                )
                db.add(reading)

                # Health score history
                h_score = 87.0 if i == 0 else (70.0 + (i * 2) % 25)
                health = HealthScore(
                    transformer_id=tx1.id,
                    timestamp=ts,
                    health_score=h_score,
                    status="Normal" if h_score >= 75 else "Warning",
                    trend="stable"
                )
                db.add(health)

            db.commit()

        # 5. Seed Anomaly Result matching mockup
        if db.query(AnomalyResult).filter(AnomalyResult.transformer_id == tx1.id).count() == 0:
            anom = AnomalyResult(
                transformer_id=tx1.id,
                timestamp=datetime.utcnow(),
                anomaly_score=0.82,
                reconstruction_error=0.78,
                threshold=0.50,
                is_anomaly=True,
                status="High Anomaly",
                explanation="The current sensor pattern is significantly different from normal behavior. Possible cause: High thermal stress due to El Niño conditions.",
                raw_features={"temperature": 68.4, "vibration": 2.35, "current": 156.8}
            )
            db.add(anom)
            db.commit()

        # 6. Seed Maintenance Recommendation matching mockup
        if db.query(MaintenanceRecommendation).filter(MaintenanceRecommendation.transformer_id == tx1.id).count() == 0:
            maint = MaintenanceRecommendation(
                transformer_id=tx1.id,
                timestamp=datetime.utcnow(),
                risk_level="High Risk",
                risk_score=78.0,
                recommended_actions=[
                    "Inspect cooling system",
                    "Check transformer oil condition",
                    "Verify load balancing",
                    "Monitor temperature closely"
                ],
                reasons=[
                    "High transformer temperature",
                    "Increased vibration level",
                    "High thermal stress due to El Niño conditions"
                ],
                suggested_timeframe="Within 3 Days",
                is_resolved=False
            )
            db.add(maint)
            db.commit()

        # 7. Seed Initial Alerts
        if db.query(Alert).filter(Alert.transformer_id == tx1.id).count() == 0:
            now = datetime.utcnow()
            alerts = [
                Alert(
                    transformer_id=tx1.id,
                    timestamp=now - timedelta(minutes=10),
                    alert_type="HIGH_TEMPERATURE",
                    severity="CRITICAL",
                    title="High Temperature Alert",
                    message="Transformer Temperature reached 68.4°C",
                    acknowledged=False
                ),
                Alert(
                    transformer_id=tx1.id,
                    timestamp=now - timedelta(minutes=14),
                    alert_type="HIGH_VIBRATION",
                    severity="HIGH",
                    title="High Vibration Alert",
                    message="Vibration level is 2.35 mm/s",
                    acknowledged=False
                ),
                Alert(
                    transformer_id=tx1.id,
                    timestamp=now - timedelta(minutes=19),
                    alert_type="HIGH_THERMAL_STRESS",
                    severity="WARNING",
                    title="High Thermal Stress",
                    message="Thermal Stress Index is 0.78",
                    acknowledged=False
                ),
                Alert(
                    transformer_id=tx1.id,
                    timestamp=now - timedelta(minutes=44),
                    alert_type="SYSTEM_NORMAL",
                    severity="INFO",
                    title="System Normal",
                    message="All parameters are within normal range",
                    acknowledged=True
                ),
            ]
            db.add_all(alerts)
            db.commit()

        print("Database seeding completed successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
