import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "GridGuard AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./gridguard.db")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-gridguard-jwt-key-2025-power-grid")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    # External APIs
    WEATHER_API_KEY: Optional[str] = os.getenv("WEATHER_API_KEY", "")
    
    # ML & Simulation
    ML_MODE: str = os.getenv("ML_MODE", "mock") # "mock" or "production"
    SIMULATOR_ENABLED: bool = os.getenv("SIMULATOR_ENABLED", "true").lower() == "true"
    
    # Model File Paths for future production mode
    MODEL_PATH: str = os.getenv("MODEL_PATH", "models/transformer_autoencoder.keras")
    SCALER_PATH: str = os.getenv("SCALER_PATH", "models/scaler.pkl")
    THRESHOLD_PATH: str = os.getenv("THRESHOLD_PATH", "models/threshold.json")
    FEATURES_PATH: str = os.getenv("FEATURES_PATH", "models/features.json")

    class Config:
        case_sensitive = True

settings = Settings()
