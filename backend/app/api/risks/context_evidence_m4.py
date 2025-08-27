# app/api/risks/context_evidence_m4.py
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.schemas.m4.evidence import EvidenceListOut, EvidenceItemOut, EvidenceCreateIn, EvidenceUpdateIn
from app.crud.m4.evidence import list_by_context, create_for_context, update_in_context, delete_in_context

router = APIRouter(prefix="/risks/risk_scenario_contexts", tags=["Risk Context Evidence (M4)"])

@router.get("/{context_id}/evidence/", response_model=EvidenceListOut)
def list_context_evidence(
    context_id: int,
    control_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None, description="Filter by evidence type"),
    freshness: Optional[str] = Query(None, pattern="^(ok|warn|overdue)$"),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("captured_at", pattern="^(captured_at|valid_until)$"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    total, items, summary = list_by_context(
        db, context_id,
        control_id=control_id,
        evidence_type=type,
        freshness=freshness,
        offset=offset, limit=limit,
        sort_by=sort_by, sort_dir=sort_dir
    )
    return {"total": total, "items": items, "summary": summary}

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
        title=body.title,
        ref=body.ref,
        captured_at=body.capturedAt,
        valid_until=body.validUntil,
        description=body.description,
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
        "freshness": "ok",  # list endpoint recomputes
    }

@router.patch("/{context_id}/evidence/{evidence_id}/", status_code=200)
def update_context_evidence(
    context_id: int,
    evidence_id: int,
    body: EvidenceUpdateIn,
    db: Session = Depends(get_db),
):
    row, err = update_in_context(
        db, context_id, evidence_id,
        type=body.type,
        title=body.title,
        ref=body.ref,
        captured_at=body.capturedAt,
        valid_until=body.validUntil,
        description=body.description,
        status=body.status,
    )
    if err == "not_found":
        raise HTTPException(404, detail="Evidence not found in this context")
    return {"ok": True}

@router.delete("/{context_id}/evidence/{evidence_id}/", status_code=204)
def delete_context_evidence(
    context_id: int,
    evidence_id: int,
    db: Session = Depends(get_db),
):
    ok = delete_in_context(db, context_id, evidence_id)
    if not ok:
        raise HTTPException(404, detail="Evidence not found in this context")
    return
