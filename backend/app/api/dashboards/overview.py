# app/routers/overview.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.dashboards.overview import OverviewSummary
from app.services.overview.overview import compute_overview_summary

router = APIRouter(prefix="/overview", tags=["overview"])

@router.get("/summary", response_model=OverviewSummary)
def get_overview_summary(
    db: Session = Depends(get_db),
):
    # For now we intentionally do not accept params (UI uses global scope).
    # Default scope can be changed centrally here later.
    return compute_overview_summary(db=db, scope_type="org", scope_id=1)
