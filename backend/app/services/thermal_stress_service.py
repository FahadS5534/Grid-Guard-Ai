import math

class ThermalStressService:
    """
    Calculates System Thermal Stress Index and Temperature Rise 
    based on transformer temperature and ambient environmental temperature.
    
    Formula:
    Temperature Rise = Transformer Temp - Ambient Temp
    Base Rise Threshold = 35.0 °C
    Thermal Stress Index = clamp( (Temp Rise / 45.0) * 0.65 + (Ambient Temp / 40.0) * 0.35, 0.0, 1.0 )
    
    Threshold Levels:
    - Low: 0.00 - 0.33
    - Moderate: 0.34 - 0.66
    - High: 0.67 - 1.00
    """

    @staticmethod
    def calculate_temperature_rise(transformer_temp: float, ambient_temp: float) -> float:
        return round(transformer_temp - ambient_temp, 1)

    @staticmethod
    def calculate_stress_index(transformer_temp: float, ambient_temp: float) -> float:
        temp_rise = transformer_temp - ambient_temp
        # Normalized rise component (max reference ~45°C rise)
        rise_component = max(0.0, temp_rise) / 45.0
        # Normalized ambient component (max reference ~40°C ambient during El Niño heatwaves)
        ambient_component = max(0.0, ambient_temp) / 40.0
        
        index = (rise_component * 0.65) + (ambient_component * 0.35)
        clamped_index = min(1.0, max(0.0, index))
        return round(clamped_index, 2)

    @staticmethod
    def get_stress_level(stress_index: float) -> str:
        if stress_index < 0.34:
            return "Low"
        elif stress_index < 0.67:
            return "Moderate"
        else:
            return "High"
