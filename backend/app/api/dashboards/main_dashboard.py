from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.dashboards.main_dashboard import DashboardSummary
from app.crud.dashboards import main_dashboard as crud
from app.database import SessionLocal


router = APIRouter(prefix="/dashboards", tags=["Dashboards"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/main/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return crud.get_dashboard_summary(db)