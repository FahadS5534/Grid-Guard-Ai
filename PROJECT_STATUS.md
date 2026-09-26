# ⚡ GridGuard AI — Project Structure & Status Report

> **Project Title**: AI-Based Predictive Maintenance for Power Grid Infrastructure under El Niño-Induced Thermal Stress using IoT Sensor Data  
> **Brand Name**: GridGuard AI  
> **Aesthetic**: Dark Industrial Power-Grid Control-Room Interface  

---

## 📂 Complete Project Structure

```
d:\El-Nino\
├── backend/                             # FastAPI Backend Service
│   ├── alembic/                         # Database Migration History
│   │   ├── versions/                    # Migration revision scripts
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── app/
│   │   ├── api/                         # API Routers & Dependency Injection
│   │   │   ├── deps.py                  # Auth & Database session dependencies
│   │   │   └── routes/                  # REST Routes & WebSocket Handlers
│   │   │       ├── alerts.py            # Alert listing & acknowledgement
│   │   │       ├── anomaly.py           # AI Anomaly Detection endpoint
│   │   │       ├── auth.py              # JWT Authentication & Registration
│   │   │       ├── dashboard.py         # Summary metrics & health trend API
│   │   │       ├── environment.py       # Climate & El Niño ENSO endpoints
│   │   │       ├── maintenance.py       # Rule-based maintenance recommendations
│   │   │       ├── reports.py           # Downloadable PDF/CSV report generation
│   │   │       ├── simulator.py         # Developer telemetry simulator trigger
│   │   │       ├── telemetry.py         # Telemetry ingestion endpoint (ESP32/Simulator)
│   │   │       ├── thermal_stress.py    # Thermal Stress Index calculations
│   │   │       ├── transformers.py      # Transformer asset CRUD operations
│   │   │       └── ws.py                # WebSocket real-time streamer
│   │   ├── core/                        # Configuration & Core Utilities
│   │   │   ├── config.py                # Pydantic Settings & Env vars
│   │   │   ├── database.py              # SQLAlchemy Session & Engine setup
│   │   │   └── security.py              # JWT tokens & PBKDF2 password hashing
│   │   ├── models/                      # Database & Integrated ML Models
│   │   │   ├── alert.py                 # Alert SQLAlchemy model
│   │   │   ├── anomaly_result.py        # Anomaly result SQLAlchemy model
│   │   │   ├── environmental_reading.py # Environmental data model
│   │   │   ├── final_lstm_autoencoder.keras # Keras Trained LSTM Autoencoder
│   │   │   ├── final_metrics.json       # Training & validation evaluation metrics
│   │   │   ├── final_model_metadata.json # Production model metadata & threshold (0.2432)
│   │   │   ├── final_scaler.joblib      # StandardScaler trained pipeline
│   │   │   ├── final_seasonal_temperature_baseline.json # Monthly baseline medians
│   │   │   ├── final_split_manifest.json# Train/val/test temporal split manifest
│   │   │   ├── final_test_results.csv   # Historical model test predictions
│   │   │   ├── health_score.py          # Health score model
│   │   │   ├── maintenance.py           # Predictive maintenance model
│   │   │   ├── report.py                # Generated report model
│   │   │   ├── sensor_reading.py        # Sensor telemetry model
│   │   │   ├── transformer.py           # Transformer asset model
│   │   │   └── user.py                  # User account model
│   │   ├── schemas/                     # Pydantic Validation Schemas
│   │   │   ├── alert.py
│   │   │   ├── anomaly.py
│   │   │   ├── dashboard.py
│   │   │   ├── environment.py
│   │   │   ├── maintenance.py
│   │   │   ├── report.py
│   │   │   ├── telemetry.py
│   │   │   ├── transformer.py
│   │   │   └── user.py
│   │   └── services/                    # Core Business Logic Services
│   │       ├── alert_service.py         # Alert engine with 15m deduplication
│   │       ├── maintenance_service.py   # Rule recommendation engine
│   │       ├── ml_service.py            # LSTM Autoencoder ML Inference Adapter
│   │       ├── report_service.py       # PDF/CSV ReportLab document generator
│   │       ├── simulator_service.py     # Realistic IoT stream simulator
│   │       ├── telemetry_service.py     # Ingestion pipeline orchestrator
│   │       ├── thermal_stress_service.py# Thermal stress index derived calculations
│   │       └── weather_service.py       # External weather/ENSO integration
│   ├── main.py                          # FastAPI Application Entry Point
│   ├── alembic.ini                      # Alembic CLI Configuration
│   ├── Dockerfile                       # Backend Containerization Specification
│   ├── requirements.txt                 # Backend Dependencies
│   └── seed.py                          # Initial Development Database Seeder
│
├── frontend/                            # React 19 + Vite + Tailwind CSS Platform
│   ├── src/
│   │   ├── assets/                      # Static assets
│   │   ├── components/
│   │   │   ├── alerts/
│   │   │   │   └── AlertRow.jsx         # Severity-coded alert row component
│   │   │   ├── cards/
│   │   │   │   ├── HealthCard.jsx       # Health metric card
│   │   │   │   ├── RecommendationCard.jsx # Maintenance action card
│   │   │   │   ├── ReportCard.jsx       # Downloadable report card
│   │   │   │   ├── SensorCard.jsx       # Key parameter card
│   │   │   │   └── StatCard.jsx         # Top dashboard status card
│   │   │   ├── charts/
│   │   │   │   ├── AnomalyLineChart.jsx
│   │   │   │   ├── HealthTrendChart.jsx # Recharts area health trend
│   │   │   │   ├── ReconstructionScatterChart.jsx # Error scatter plot
│   │   │   │   ├── SeaSurfaceChart.jsx  # El Niño SST trend chart
│   │   │   │   ├── SensorLineChart.jsx  # Live telemetry sparklines
│   │   │   │   └── ThermalTrendChart.jsx# Thermal stress index trend
│   │   │   ├── gauges/
│   │   │   │   ├── RiskGauge.jsx        # Radial progress maintenance risk gauge
│   │   │   │   └── ThermalGauge.jsx     # Arc gauge for thermal stress level
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx           # Top header with transformer selector & simulator
│   │   │   │   ├── Layout.jsx           # Responsive shell layout wrapper
│   │   │   │   └── Sidebar.jsx          # Persistent left navigation sidebar
│   │   │   ├── status/
│   │   │   │   ├── LiveIndicator.jsx    # Pulsing live indicator badge
│   │   │   │   ├── RiskBadge.jsx        # Risk level badge
│   │   │   │   └── StatusBadge.jsx      # Operational state badge
│   │   │   └── visualization/
│   │   │       └── Transformer3DView.jsx# Digital Twin schematic transformer
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Auth JWT state provider
│   │   │   └── TransformerContext.jsx   # Global selected transformer state
│   │   ├── pages/                       # 8 Visual Dashboard Pages
│   │   │   ├── AIAnomalyDetection.jsx   # Page 6: Autoencoder anomaly status
│   │   │   ├── AlertsReports.jsx        # Page 8: Recent alerts & PDF reports
│   │   │   ├── Dashboard.jsx            # Page 2: Operational health overview
│   │   │   ├── ElNinoMonitor.jsx        # Page 4: Climate & SST tracking
│   │   │   ├── Home.jsx                 # Page 1: Hero landing page
│   │   │   ├── LiveMonitoring.jsx       # Page 3: Live telemetry & 3D view
│   │   │   ├── PredictiveMaintenance.jsx# Page 7: Risk gauge & actions
│   │   │   └── ThermalStress.jsx        # Page 5: Thermal stress gauge & rise
│   │   ├── services/
│   │   │   ├── api.js                   # Frontend HTTP client wrapper
│   │   │   └── websocket.js             # Real-time WebSocket connection manager
│   │   ├── App.jsx                      # React Router routes setup
│   │   ├── index.css                    # Control-room design tokens & CSS
│   │   └── main.jsx                     # React Root Mounting Entry Point
│   ├── nginx.conf                       # Production Nginx reverse proxy config
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile                       # Multi-stage Frontend Docker Specification
│
├── ml_training/                         # Google Colab ML Training Scripts
│   ├── gridguard_colab_training.py      # Standalone Python training script
│   └── gridguard_autoencoder_training.ipynb # Google Colab Notebook file
│
├── docs/                                # Technical Documentation
│   └── architecture.md                  # System architecture blueprint & ASCII diagram
│
├── docker-compose.yml                   # Docker Multi-Container Configuration
├── .env.example                         # Environment Variables Template
├── README.md                            # Comprehensive Setup & API Reference
└── PROJECT_STATUS.md                    # Current Implementation Status Report
```

---

## ✅ What Has Been Done (Completed Implementations)

### 1. Backend REST & WebSocket Platform (FastAPI)
- **FastAPI Core**: Modular architecture with routes, Pydantic schemas, SQLAlchemy models, and service layer.
- **Database Layer**: SQLite default for quick local running, fully configured for PostgreSQL / TimescaleDB with Alembic migration history.
- **Data Ingestion API**: Endpoint `POST /api/v1/telemetry` for receiving hardware/simulator sensor readings.
- **Real-Time Streaming**: WebSocket endpoint `/ws/transformers/{id}` for live client updates.
- **Report Engine**: Automatic PDF and CSV generation for Daily, Weekly, Monthly, and Custom date ranges using ReportLab.
- **Alert Engine**: Severity-classified alerts (`CRITICAL`, `HIGH`, `WARNING`, `INFO`) with a 15-minute deduplication window and acknowledgement API.

### 2. Trained ML Autoencoder Model Integration
- Integrated the uploaded **LSTM Autoencoder** model (`final_lstm_autoencoder.keras`) and **StandardScaler** (`final_scaler.joblib`).
- Incorporated `final_model_metadata.json` ($95\text{th percentile threshold} = 0.2432$).
- Implemented **Seasonal Temperature Baseline** ($T_{\text{baseline}} = 27.0\text{°C}$) to compute monthly temperature deviation ($\text{Temp Dev} = T_{\text{measured}} - T_{\text{seasonal\_baseline}}$).
- Production Inference Adapter in `app/services/ml_service.py` outputs:
  - `reconstruction_error`
  - `anomaly_score` ($0.00 - 1.00$)
  - `health_score` ($100 \times (1 - \text{anomaly\_score})$)
  - `risk_category` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - `is_anomaly` status boolean

### 3. Frontend Dashboard Interface (React + Tailwind CSS)
Constructed **all 8 visual pages** matching the industrial control-room mockup design:
1. **Home (`/`)**: Executive hero landing page with capability cards and live system stats.
2. **Dashboard (`/dashboard`)**: Transformer ID, Status, Health Score, Last Updated cards, key parameter cards, and time-range selectable health trend chart.
3. **Live Monitoring (`/live-monitoring`)**: Live telemetry sparklines, interactive 3D digital-twin schematic visualization, side parameter card, and streaming status bar.
4. **El Niño Monitor (`/el-nino-monitor`)**: Active El Niño swirl indicator, Sea Surface Temperature (SST) trend chart, ambient weather metrics, and outlook section.
5. **Thermal Stress (`/thermal-stress`)**: System Thermal Stress Index arc gauge, temperature rise summary ($T_{\text{rise}} = T_{\text{transformer}} - T_{\text{ambient}}$), stress index trend chart, and level guide.
6. **AI Anomaly Detection (`/ai-anomaly-detection`)**: Autoencoder score card, neural network node graphic, input feature cards, reconstruction error scatter plot, and detection explanation.
7. **Predictive Maintenance (`/predictive-maintenance`)**: Maintenance risk radial progress gauge (`78% High Risk`), recommended actions checklist, reason breakdown, and suggested timeframe.
8. **Alerts & Reports (`/alerts-reports`)**: Recent alerts log with severity badges, acknowledgement toggles, and downloadable PDF/CSV reports.

### 4. Development & Deployment Tools
- **Development Simulator**: Integrated top header button `Simulate Telemetry ⚡` to publish realistic test readings.
- **Dockerization**: `Dockerfile` for backend, multi-stage `Dockerfile` for frontend with Nginx, and `docker-compose.yml` for multi-container deployment.
- **Documentation**: Generated `README.md`, `docs/architecture.md`, and Google Colab scripts in `ml_training/`.

---

## 🚦 Current Running Status

- **Backend**: Live at `http://localhost:8000` (Swagger UI at `http://localhost:8000/docs`)
- **Frontend**: Live at `http://localhost:3000`
- **Database**: Initialized and seeded with transformers `TX-101` and `TX-102`.
