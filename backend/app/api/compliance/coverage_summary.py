from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.compliance.coverage_summary import CoverageSummary
from app.services.compliance.coverage_summary import compute_coverage_summary

router = APIRouter(prefix="/compliance/coverage", tags=["Compliance Coverage"])

@router.get("/summary", response_model=CoverageSummary)
def get_coverage_summary(
    version_id: int = Query(..., description="Framework version id"),
    scope_type: str = Query(..., description="Scope type (e.g., asset, tag, asset_group, asset_type, org)"),
    scope_id: int = Query(..., description="Scope id"),
    db: Session = Depends(get_db),
):
    """
    Returns KPI-style summary for the requested framework version and scope.
    """
    return compute_coverage_summary(db=db, version_id=version_id, scope_type=scope_type, scope_id=scope_id)
