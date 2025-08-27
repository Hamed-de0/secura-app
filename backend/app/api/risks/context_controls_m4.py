# app/api/risks/context_controls_m4.py
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.m4.context_controls import (
    ContextControlsListOut,
    ContextControlOut,
    ContextControlCreate,
    ContextControlUpdate,
)
from app.crud.m4.context_controls import (
    list_for_context,
    create_link_simple,
    update_link_status,
    delete_link,
)

router = APIRouter(prefix="/risks/risk_scenario_contexts", tags=["Risk Context Controls (M4)"])

@router.get("/{context_id}/controls/", response_model=ContextControlsListOut)
def list_context_controls(
    context_id: int,
    offset: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=200),
    sort_by: str = Query("status", pattern="^(status|last_evidence|code|title)$"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    include: str = Query("", description='pass "summary" to include aggregates'),
    db: Session = Depends(get_db),
):
    total, items, summary = list_for_context(
        db,
        context_id,
        offset=offset,
        limit=limit,
        sort_by=sort_by,
        sort_dir=sort_dir,
        include_summary=(include == "summary"),
    )
    return {"total": total, "items": items, "summary": summary}

@router.post("/{context_id}/controls/", response_model=ContextControlOut, status_code=status.HTTP_201_CREATED)
def link_control(
    context_id: int,
    payload: ContextControlCreate,
    db: Session = Depends(get_db),
):
    row, err = create_link_simple(db, context_id, payload.controlId, payload.status)
    if err == "duplicate":
        raise HTTPException(status_code=409, detail="Control already linked to this context")
    # shape response
    code = getattr(getattr(row, "control", None), "reference_code", None)
    title = (getattr(getattr(row, "control", None), "title_en", None)
             or getattr(getattr(row, "control", None), "title_de", None))
    return {
        "id": row.id,
        "contextId": row.risk_scenario_context_id,
        "controlId": row.control_id,
        "code": code,
        "title": title,
        "status": row.assurance_status,
        "lastEvidenceAt": None,
    }

@router.patch("/context_controls/{link_id}/", status_code=200)
def update_link(link_id: int, payload: ContextControlUpdate, db: Session = Depends(get_db)):
    row, err = update_link_status(db, link_id, payload.status)
    if err == "not_found":
        raise HTTPException(404, detail="Link not found")
    return {"ok": True}

@router.delete("/context_controls/{link_id}/", status_code=204)
def unlink(link_id: int, db: Session = Depends(get_db)):
    ok = delete_link(db, link_id)
    if not ok:
        raise HTTPException(404, detail="Link not found")
    return
