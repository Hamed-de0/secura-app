# app/api/risks/context_evidence_m4.py
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.schemas.m4.evidence import EvidenceListOut, EvidenceItemOut, EvidenceCreateIn
from app.crud.m4.evidence import list_by_context, create_for_context

router = APIRouter(prefix="/risks/risk_scenario_contexts", tags=["Risk Context Evidence (M4)"])

@router.get("/{context_id}/evidence/", response_model=EvidenceListOut)
def list_context_evidence(
    context_id: int,
    control_id: Optional[int] = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("captured_at", pattern="^(captured_at|valid_until)$"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    total, items, summary = list_by_context(
        db, context_id,
        control_id=control_id,
        offset=offset, limit=limit,
        sort_by=sort_by, sort_dir=sort_dir
    )
    return {"total": total, "items": items, "summary": summary}

# app/api/risks/context_evidence_m4.py  (only the POST handler changes)

@router.post("/{context_id}/evidence/", response_model=EvidenceItemOut, status_code=status.HTTP_201_CREATED)
def create_context_evidence(
    context_id: int,
    body: EvidenceCreateIn,
    db: Session = Depends(get_db),
):
    row, err = create_for_context(
        db, context_id,
        control_id=body.controlId,
        type=body.type,
        title=body.title,                    # ← NEW
        ref=body.ref,
        captured_at=body.capturedAt,
        valid_until=body.validUntil,
        description=body.description,        # ← NEW
    )
    if err == "link_not_found":
        raise HTTPException(400, detail="Control is not linked to this context")

    return {
        "id": row.id,
        "contextId": context_id,
        "controlId": body.controlId,
        "linkId": row.control_context_link_id,
        "type": row.evidence_type or "other",
        "ref": row.evidence_url or getattr(row, "file_path", None),
        "capturedAt": row.collected_at,
        "validUntil": row.valid_until,
        "freshness": "ok",
    }



