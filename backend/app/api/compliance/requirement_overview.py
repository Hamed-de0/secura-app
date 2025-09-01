from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db  # adjust to your project's dependency
from app.schemas.compliance.requirement_overview import RequirementOverviewResponse
from app.services.compliance.requirement_overview import RequirementOverviewService

router = APIRouter(prefix="/compliance", tags=["Compliance Requirements"])


@router.get(
    "/requirement/{requirement_id}/overview",
    response_model=RequirementOverviewResponse,
    summary="Requirement overview (everything view)",
)
def get_requirement_overview(
    requirement_id: int,
    version_id: int = Query(..., description="Framework version id"),
    scope_type: Optional[str] = Query(None),
    scope_id: Optional[int] = Query(None),
    include: List[str] = Query(
        default=["usage", "mappings", "evidence", "exceptions", "lifecycle", "owners", "suggested_controls"],
        description="Repeatable include flags"
    ),
    db: Session = Depends(get_db),
):
    try:
        return RequirementOverviewService.get_overview(
            db,
            requirement_id=requirement_id,
            version_id=version_id,
            scope_type=scope_type,
            scope_id=scope_id,
            include=include,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
