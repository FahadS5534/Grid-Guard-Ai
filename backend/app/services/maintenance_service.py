from typing import Dict, Any, List

class MaintenanceRecommendationService:
    """
    Rule-based predictive maintenance decision-support recommendation engine.
    Analyzes telemetry, thermal stress, AI anomaly reconstruction results, and environmental conditions.
    Provides operator recommendations with explicit rationale breakdown.
    """

    @staticmethod
    def evaluate(
        sensor_data: Dict[str, float],
        thermal_stress: float,
        is_anomaly: bool,
        health_score: float,
        reconstruction_error: float = 0.08,
        threshold: float = 0.2432,
        dominant_signal: str = "Temperature Deviation",
        enso_active: bool = True
    ) -> Dict[str, Any]:
        temp = sensor_data.get("temperature", 68.4)
        vibration = sensor_data.get("vibration", 2.35)
        current = sensor_data.get("current", 156.8)
        voltage = sensor_data.get("voltage", 230.0)
        ambient = sensor_data.get("ambient_temperature", 32.7)

        recommended_actions = []
        reasons = []

        # 1. Evaluate Anomaly Rationale
        if is_anomaly or reconstruction_error >= threshold:
            reasons.append(f"AI reconstruction error ({reconstruction_error:.4f}) exceeded frozen decision threshold ({threshold:.4f}).")
            reasons.append(f"Dominant reconstruction anomaly detected in: {dominant_signal}.")
        
        if temp >= 65.0 or thermal_stress >= 0.67:
            reasons.append(f"Elevated transformer operating temperature ({temp}°C) causing high thermal stress index ({thermal_stress:.2f}).")
            recommended_actions.append("Inspect transformer thermal and cooling conditions (fans/radiators).")

        if current >= 150.0:
            reasons.append(f"High load current ({current} A) detected on primary phase.")
            recommended_actions.append("Review load balancing and current feeder distribution.")

        if abs(voltage - 230.0) >= 15.0:
            reasons.append(f"Voltage fluctuation ({voltage} V) deviating from nominal 230V reference.")
            recommended_actions.append("Verify tap-changer operation and busbar voltage stability.")

        if enso_active:
            reasons.append("Environmental Context: Active El Niño heatwave conditions elevate ambient temperature baseline.")

        # Determine Risk Category
        if health_score < 30.0 or reconstruction_error >= threshold * 2.0:
            risk_category = "CRITICAL"
            risk_level = "Critical Risk"
            timeframe = "Immediate (Within 24 Hours)"
            if not recommended_actions:
                recommended_actions.append("Escalate for immediate engineering assessment and thermal inspection.")
            recommended_actions.append("Follow established grid safety and emergency load-shedding procedures if required.")
        elif is_anomaly or health_score < 60.0 or thermal_stress >= 0.70:
            risk_category = "HIGH"
            risk_level = "High Risk"
            timeframe = "Within 3 Days"
            recommended_actions.append("Schedule preventive physical inspection of cooling system and transformer oil condition.")
            recommended_actions.append("Check for persistent thermal and electrical pattern abnormalities.")
        elif health_score < 80.0 or thermal_stress >= 0.40:
            risk_category = "MEDIUM"
            risk_level = "Medium Risk"
            timeframe = "Within 7 Days"
            recommended_actions.append("Increase telemetry monitoring frequency.")
            recommended_actions.append("Review 24-hour temperature and load current trends.")
        else:
            risk_category = "LOW"
            risk_level = "Low Risk / Normal"
            timeframe = "Routine (Next 30 Days)"
            recommended_actions = [
                "Continue standard routine telemetry monitoring.",
                "Maintain scheduled periodic maintenance checklist."
            ]
            reasons = ["Transformer parameters and LSTM reconstruction error remain within nominal baseline limits."]

        risk_score = round(min(100.0, max(0.0, 100.0 - health_score)), 0)

        return {
            "risk_category": risk_category,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "recommended_actions": recommended_actions,
            "reasons": reasons,
            "suggested_timeframe": timeframe,
            "disclaimer": "Recommendations provide operational decision support for human maintenance teams. They do not constitute automatic proof of physical hardware failure."
        }
