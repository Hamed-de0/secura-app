# app/api/risks/context_evidence_m4.py
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.schemas.m4.evidence import EvidenceListOut, EvidenceItemOut, EvidenceCreateIn, EvidenceUpdateIn
from app.crud.m4.evidence import (
    list_by_context,
    create_for_context,
    update_in_context,
    delete_in_context,
    restore_in_context,
    supersede_in_context,
)

router = APIRouter(prefix="/risks/risk_scenario_contexts", tags=["Risk Context Evidence (M4)"])

@router.get("/{context_id}/evidence/", response_model=EvidenceListOut)
def list_context_evidence(
    context_id: int,
    control_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None, description="Filter by evidence type"),
    freshness: Optional[str] = Query(None, pattern="^(ok|warn|overdue)$"),
    status: Optional[str] = Query(
        "active",
        pattern="^(active|retired|superseded|draft|all)$",
        description=(
            "Lifecycle status filter. Defaults to 'active' for conservative behavior. "
            "Use status=all to include inactive (retired/superseded/draft)."
        ),
    ),
    include_inactive: bool = Query(
        False,
        description=(
            "Backward-compat flag: when true and no explicit status is provided, include inactive items."
        ),
    ),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("captured_at", pattern="^(captured_at|valid_until)$"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """
    Return evidence items associated with the given risk context.

    Defaults: applies a conservative lifecycle filter of status='active'.
    - To include inactive evidence (retired/superseded/draft), pass `status=all`.
    - `include_inactive=true` is kept for backward compatibility; if provided and
      `status` is not set, inactive items are included.
    - Freshness filter (ok|warn|overdue) applies after lifecycle filtering.
    """
    total, items, summary = list_by_context(
        db, context_id,
        control_id=control_id,
        evidence_type=type,
        freshness=freshness,
        status=status,
        include_inactive=include_inactive,
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
        "status": getattr(row, 'lifecycle_status', 'active'),
        "supersedes_id": getattr(row, 'supersedes_id', None),
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

# --- Passthrough convenience endpoints (lifecycle) ---

@router.post("/{context_id}/evidence/{evidence_id}/restore/", status_code=200)
def restore_context_evidence(context_id: int, evidence_id: int, db: Session = Depends(get_db)):
    row = restore_in_context(db, context_id, evidence_id)
    if not row:
        raise HTTPException(404, detail="Evidence not found in this context")
    return {"ok": True}

class SupersedeBody(BaseModel):
    replacement_id: int

@router.post("/{context_id}/evidence/{evidence_id}/supersede/", status_code=200)
def supersede_context_evidence(context_id: int, evidence_id: int, body: SupersedeBody, db: Session = Depends(get_db)):
    row = supersede_in_context(db, context_id, evidence_id, body.replacement_id)
    if not row:
        raise HTTPException(404, detail="Evidence not found in this context")
    return {"ok": True}
