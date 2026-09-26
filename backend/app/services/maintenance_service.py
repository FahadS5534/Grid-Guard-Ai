from typing import Dict, Any, List

class MaintenanceRecommendationService:
    """
    Rule-based predictive maintenance recommendation engine.
    Analyzes telemetry, thermal stress, AI anomaly results, and environmental conditions.
    """

    @staticmethod
    def evaluate(
        sensor_data: Dict[str, float],
        thermal_stress: float,
        is_anomaly: bool,
        health_score: float,
        enso_active: bool = True
    ) -> Dict[str, Any]:
        temp = sensor_data.get("temperature", 68.4)
        vibration = sensor_data.get("vibration", 2.35)
        current = sensor_data.get("current", 156.8)
        ambient = sensor_data.get("ambient_temperature", 32.7)

        recommended_actions = []
        reasons = []

        # Rule 1: High Temperature & Thermal Stress
        if temp >= 65.0 or thermal_stress >= 0.67:
            recommended_actions.append("Inspect cooling system")
            reasons.append("High transformer temperature")

        # Rule 2: Vibration & Mechanical condition
        if vibration >= 2.0:
            recommended_actions.append("Check transformer oil condition")
            reasons.append("Increased vibration level")

        # Rule 3: Current & Load
        if current >= 150.0:
            recommended_actions.append("Verify load balancing")

        # Rule 4: El Niño & Environmental Heatwave
        if ambient >= 32.0 or enso_active:
            recommended_actions.append("Monitor temperature closely")
            if enso_active and thermal_stress >= 0.6:
                reasons.append("High thermal stress due to El Niño conditions")

        # Ensure fallback actions if all normal
        if not recommended_actions:
            recommended_actions = [
                "Continue standard routine inspection schedule",
                "Verify sensor calibration"
            ]
            reasons = ["All parameters are within normal baseline ranges."]

        # Calculate Risk Score (0 - 100%)
        risk_score = round(min(98.0, max(12.0, 100.0 - health_score + (thermal_stress * 30.0))), 0)

        if risk_score >= 75.0 or is_anomaly:
            risk_level = "High Risk"
            timeframe = "Within 3 Days"
        elif risk_score >= 45.0:
            risk_level = "Moderate Risk"
            timeframe = "Within 7 Days"
        else:
            risk_level = "Low Risk"
            timeframe = "Routine (Next 30 Days)"

        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "recommended_actions": recommended_actions,
            "reasons": reasons,
            "suggested_timeframe": timeframe
        }
