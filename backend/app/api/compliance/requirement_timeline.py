from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.compliance.timeline import UnifiedTimelineItem
from app.services.compliance.requirement_timeline import RequirementTimelineService

router = APIRouter(prefix="/compliance", tags=["compliance:timeline"])

@router.get(
    "/requirement/{requirement_id}/timeline",
    response_model=List[UnifiedTimelineItem],
    summary="Unified timeline for a requirement",
)
def requirement_timeline(
    requirement_id: int,
    version_id: int = Query(...),
    scope_type: Optional[str] = Query(None),
    scope_id: Optional[int] = Query(None),
    kinds: List[str] = Query(default=["evidence", "exception", "mapping"]),
    page: int = Query(1, ge=1, description="1-based page index"),
    size: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return RequirementTimelineService.get_timeline(
        db,
        requirement_id=requirement_id,
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        limit=size,
        page=page,
        kinds=kinds,
    )
