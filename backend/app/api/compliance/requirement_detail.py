from __future__ import annotations
from typing import List, Set
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db, get_current_user
from app.schemas.compliance.requirement_detail import RequirementDetailResponse
from app.services.compliance import requirement_detail as svc

router = APIRouter(prefix="/compliance", tags=["Compliance Requirements"])

@router.get("/requirements/{requirement_id}/detail", response_model=RequirementDetailResponse)
def get_requirement_detail(
    requirement_id: int,
    version_id: int = Query(...),
    scope_type: str = Query(...),
    scope_id: int = Query(...),
    include: List[str] = Query(default=["mappings", "evidence", "exceptions"]),
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    include_set: Set[str] = set(include or [])
    return svc.get_detail(
        db=db,
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        requirement_id=requirement_id,
        include=include_set,
    )

@router.get("/evidence/{evidence_id}/lifecycle", response_model=list[dict])
def get_evidence_lifecycle(
    evidence_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    return svc.get_evidence_lifecycle(db, evidence_id)
