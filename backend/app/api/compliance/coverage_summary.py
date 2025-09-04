from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps.scope import resolve_scope
from app.database import get_db
from typing import List
from app.schemas.compliance.coverage_summary import CoverageSummary, CoverageSummaryWithMeta
from app.services.compliance.coverage_summary import compute_coverage_summary, compute_coverage_summary_list

router = APIRouter(prefix="/compliance/coverage", tags=["Compliance Coverage"])

@router.get("/summary", response_model=CoverageSummary)
def get_coverage_summary(
    scope: tuple[str, int] = Depends(resolve_scope),
    version_id: int = Query(..., description="Framework version id"),
    # scope_type: str = Query(..., description="Scope type (e.g., asset, tag, asset_group, asset_type, org)"),
    # scope_id: int = Query(..., description="Scope id"),
    db: Session = Depends(get_db),
):
    """
    Returns KPI-style summary for the requested framework version and scope.
    """
    scope_type, scope_id = scope
    return compute_coverage_summary(db=db, version_id=version_id, scope_type=scope_type, scope_id=scope_id)

# --- NEW: list (multi-version) ------------------------------------------------
@router.get("/summary/list", response_model=List[CoverageSummaryWithMeta])
def get_coverage_summary_list(
    scope: tuple[str, int] = Depends(resolve_scope),
    version_ids: List[int] | None = Query(None, description="Repeat or CSV: version_ids=1&version_ids=2 OR version_ids=1,2"),
    version_ids_csv: str | None = Query(None, alias="version_ids", include_in_schema=False),
    db: Session = Depends(get_db),
):
    """
    Returns enriched summaries for multiple framework versions in the same scope.
    Accepts either repeated `version_ids` or a single CSV string.
    """
    scope_type, scope_id = scope
    # Normalize: repeated list OR CSV
    ids: List[int] = []
    if version_ids:
        ids = list({int(v) for v in version_ids})
    elif version_ids_csv:
        parts = [p.strip() for p in version_ids_csv.split(",") if p.strip()]
        ids = list({int(p) for p in parts})
    if not ids:
        return []
    return compute_coverage_summary_list(db=db, version_ids=ids, scope_type=scope_type, scope_id=scope_id)


