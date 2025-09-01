# app/api/compliance/suggested_controls.py
from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.compliance.requirement_overview import SuggestedControl
from app.services.compliance.suggested_controls import get_suggested_controls

router = APIRouter(prefix="/compliance", tags=["compliance:suggestions"])

@router.get(
    "/requirements/{requirement_id}/suggested_controls",
    response_model=List[SuggestedControl],
    summary="Suggest controls for a requirement"
)
def suggested_controls(
    requirement_id: int,
    version_id: int = Query(...),
    scope_type: Optional[str] = Query(None),
    scope_id: Optional[int] = Query(None),
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return get_suggested_controls(
        db,
        requirement_id=requirement_id,
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        limit=limit,
    )
