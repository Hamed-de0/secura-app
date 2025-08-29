from __future__ import annotations
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query, Header
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.schemas.evidence import (
    EvidenceItemCreate, EvidenceItemUpdate, EvidenceItemOut, EvidenceListOut, EvidenceArtifactOut
)
from app.crud.evidence import (
    create_evidence_item, update_evidence_item, get_evidence_item,
    list_evidence_for_link, delete_evidence_item,
    create_artifact_db, attach_artifact_to_evidence
)
from app.crud.evidence import lifecycle as lc

router = APIRouter(prefix="/evidence", tags=["Evidence"])

# --- Create evidence metadata (no file yet) ---
@router.post("/controls/{link_id}", response_model=EvidenceItemOut)
def create_evidence(link_id: int,
                    payload: EvidenceItemCreate,
                    db: Session = Depends(get_db),
                    user_id: Optional[int] = None,
                    x_user: Optional[str] = Header(None)):
    row = create_evidence_item(db, link_id=link_id, submitted_by=user_id, payload=payload)
    try:
        meta = {"actor_name": (x_user or "system")}
        lc.write_event(db, row.id, 'created', actor_id=user_id, notes=None, meta=meta)
    except Exception:
        pass
    return row

# --- Upload/attach an artifact (DB-blob fallback, multipart) ---
@router.post("/{evidence_id}/artifact", response_model=EvidenceArtifactOut)
async def upload_artifact_db(evidence_id: int,
                             file: UploadFile = File(...),
                             db: Session = Depends(get_db)):
    content = await file.read()
    art = create_artifact_db(
        db,
        filename=file.filename,
        content_type=file.content_type,
        blob=content,
        size=len(content)
    )
    # link to evidence
    row = attach_artifact_to_evidence(db, evidence_id=evidence_id, artifact_id=art.id)
    if not row:
        raise HTTPException(404, "Evidence not found")
    return art

# --- Update evidence (status transitions, review) ---
@router.patch("/{evidence_id}", response_model=EvidenceItemOut)
def patch_evidence(evidence_id: int, payload: EvidenceItemUpdate, db: Session = Depends(get_db), x_user: Optional[str] = Header(None)):
    row = update_evidence_item(db, evidence_id=evidence_id, payload=payload)
    if not row:
        raise HTTPException(404, "Evidence not found")
    try:
        meta = {"actor_name": (x_user or "system")}
        # Mark fields hinted by payload
        for k in ("title", "ref", "description"):
            if getattr(payload, k, None) is not None:
                meta[k] = True
        lc.write_event(db, row.id, 'updated', meta=meta)
    except Exception:
        pass
    return row

# --- Get / List / Delete ---
@router.get("/{evidence_id}", response_model=EvidenceItemOut)
def get_evidence(evidence_id: int, db: Session = Depends(get_db)):
    row = get_evidence_item(db, evidence_id)
    if not row:
        raise HTTPException(404, "Evidence not found")
    return row

@router.get("/controls/{link_id}", response_model=EvidenceListOut)
def list_evidence(
    link_id: int,
    status: str = Query(
        "active",
        pattern="^(active|all)$",
        description=(
            "Lifecycle status filter. Default 'active' for cross-API consistency; "
            "pass status=all to include any inactive records if/when lifecycle is supported."
        ),
    ),
    db: Session = Depends(get_db),
):
    """
    List evidence items linked to a control-context link.

    Notes:
    - Conservative default: status='active'. This endpoint currently does not model
      lifecycle states (draft/retired/superseded); it returns all rows regardless.
      The parameter is accepted for forward/backward compatibility and to align
      with other evidence list APIs. Use status=all to opt out of any filtering
      once lifecycle is introduced.
    - Backward compatible with older clients that expect all rows.
    """
    items = list_evidence_for_link(db, link_id)
    # No lifecycle concept on this model; we do not filter here.
    return {"link_id": link_id, "items": items}

@router.delete("/{evidence_id}")
def delete_evidence(evidence_id: int, db: Session = Depends(get_db), x_user: Optional[str] = Header(None)):
    ok = delete_evidence_item(db, evidence_id)
    if not ok:
        raise HTTPException(404, "Evidence not found")
    try:
        meta = {"actor_name": (x_user or "system")}
        lc.write_event(db, evidence_id, 'retired', meta=meta)
    except Exception:
        pass
    return {"deleted": True}
