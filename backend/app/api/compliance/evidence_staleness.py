from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.compliance.evidence_staleness import EvidenceStalenessResponse
from app.services.compliance.evidence_staleness import list_stale_or_expiring_evidence

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.get("/stale", response_model=EvidenceStalenessResponse)
def get_stale_or_expiring_evidence(
    within_days: int = Query(30, ge=0, le=365),
    scope_type: str | None = Query(None, description="Optional scope filter"),
    scope_id: int | None = Query(None, description="Optional scope filter"),
    status: str | None = Query(None, description="expired | expiring_soon"),
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """
    List evidence that is expired or will expire within the given window.
    If your data model stores `valid_until` directly, it will be used.
    If not, and an EvidencePolicy exists (by control), a derived `valid_until` is computed from `collected_at`.
    """
    return list_stale_or_expiring_evidence(
        db=db,
        within_days=within_days,
        scope_type=scope_type,
        scope_id=scope_id,
        status=status,
        page=page,
        size=size,
    )
