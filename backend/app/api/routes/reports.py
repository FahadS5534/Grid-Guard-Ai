from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports System"])

@router.get("", response_model=List[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.generated_at.desc()).all()
    if not reports:
        # Pre-seed available standard reports matching mockup
        now = datetime.utcnow()
        r1 = ReportService.generate_report(db, "DAILY", "Daily Transformer Health Report", "May 25, 2025", "pdf")
        r2 = ReportService.generate_report(db, "WEEKLY", "Weekly Operational Analytics Report", "May 19 – May 25, 2025", "pdf")
        r3 = ReportService.generate_report(db, "MONTHLY", "Monthly Thermal Stress Overview", "May 2025", "pdf")
        return [r1, r2, r3]
    return reports

@router.post("", response_model=ReportResponse)
def create_custom_report(req: ReportCreate, db: Session = Depends(get_db)):
    range_str = f"{req.from_date or 'May 01, 2025'} - {req.to_date or 'May 25, 2025'}"
    report = ReportService.generate_report(
        db=db,
        report_type=req.report_type,
        title=req.title,
        date_range=range_str,
        format_type="pdf"
    )
    return report

@router.get("/daily/download")
def download_daily_report(db: Session = Depends(get_db)):
    report = ReportService.generate_report(db, "DAILY", "Daily Health Report", "May 25, 2025", "pdf")
    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename="GridGuard_Daily_Report.pdf"
    )

@router.get("/weekly/download")
def download_weekly_report(db: Session = Depends(get_db)):
    report = ReportService.generate_report(db, "WEEKLY", "Weekly Analytics Report", "May 19 - May 25, 2025", "pdf")
    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename="GridGuard_Weekly_Report.pdf"
    )

@router.get("/monthly/download")
def download_monthly_report(db: Session = Depends(get_db)):
    report = ReportService.generate_report(db, "MONTHLY", "Monthly Executive Report", "May 2025", "pdf")
    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename="GridGuard_Monthly_Report.pdf"
    )

@router.get("/{report_id}/download")
def download_report_by_id(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not report.file_path:
        raise HTTPException(status_code=404, detail="Report file not found")
    media = "application/pdf" if report.file_format == "pdf" else "text/csv"
    return FileResponse(path=report.file_path, media_type=media, filename=f"GridGuard_Report_{report.id}.{report.file_format}")
