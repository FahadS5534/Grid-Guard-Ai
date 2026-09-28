from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import (
    auth, transformers, telemetry, dashboard,
    environment, thermal_stress, anomaly, maintenance,
    alerts, reports, simulator, simulation, ws
)
from seed import seed_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Based Predictive Maintenance for Power Grid Infrastructure under El Niño-Induced Thermal Stress",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/demo flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event: Auto-create database tables & seed initial development data
@app.on_event("startup")
def startup_event():
    seed_db()

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc)
            }
        }
    )

# Include API Routers under /api/v1
api_prefix = settings.API_V1_STR

app.include_router(auth.router, prefix=api_prefix)
app.include_router(transformers.router, prefix=api_prefix)
app.include_router(telemetry.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(environment.router, prefix=api_prefix)
app.include_router(thermal_stress.router, prefix=api_prefix)
app.include_router(anomaly.router, prefix=api_prefix)
app.include_router(maintenance.router, prefix=api_prefix)
app.include_router(alerts.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(simulator.router, prefix=api_prefix)
app.include_router(simulation.router, prefix=api_prefix)
app.include_router(ws.router)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Online",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }
