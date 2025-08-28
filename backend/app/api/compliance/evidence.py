from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.compliance.evidence import ControlEvidenceCreate, ControlEvidenceUpdate, ControlEvidenceOut
from app.crud.compliance import control_evidence as crud
from app.crud.evidence import lifecycle

router = APIRouter(prefix="/evidence", tags=["Compliance - Evidence"])

@router.post("", response_model=ControlEvidenceOut)
def add_evidence(payload: ControlEvidenceCreate, db: Session = Depends(get_db)):
    obj = crud.create(db, payload)
    try:
        lifecycle.write_event(db, obj.id, 'created')
    except Exception:
        pass
    return obj

@router.get("/control/{link_id}", response_model=List[ControlEvidenceOut])
def list_evidence(link_id: int, status: str = 'active', db: Session = Depends(get_db)):
    rows = crud.list_by_link(db, link_id)
    if status and status != 'all':
        # filter by lifecycle status if present (default active)
        rows = [r for r in rows if getattr(r, 'lifecycle_status', 'active') == status]
    return rows

@router.patch("/{evidence_id}", response_model=ControlEvidenceOut)
def update_evidence(evidence_id: int, payload: ControlEvidenceUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, evidence_id, payload)
    if not obj:
        raise HTTPException(404, "Not found")
    try:
        lifecycle.write_event(db, obj.id, 'updated')
    except Exception:
        pass
    return obj

@router.delete("/{evidence_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_evidence(evidence_id: int, db: Session = Depends(get_db)):
    ok = lifecycle.soft_delete(db, evidence_id)
    if not ok:
        raise HTTPException(404, "Not found")
    return

@router.post("/{evidence_id}/restore/", response_model=ControlEvidenceOut)
def restore_evidence(evidence_id: int, db: Session = Depends(get_db)):
    row = lifecycle.restore(db, evidence_id)
    if not row:
        raise HTTPException(404, "Not found")
    return row

@router.post("/{evidence_id}/supersede/", response_model=ControlEvidenceOut)
def supersede_evidence(evidence_id: int, replacement_id: int, db: Session = Depends(get_db)):
    row = lifecycle.supersede(db, evidence_id, replacement_id)
    if not row:
        raise HTTPException(404, "Not found")
    return row

@router.get("/{evidence_id}/lifecycle/")
def list_evidence_lifecycle(evidence_id: int, db: Session = Depends(get_db)):
    events = lifecycle.list_events(db, evidence_id)
    return [
        {
            'id': ev.id,
            'evidence_id': ev.evidence_id,
            'event': ev.event,
            'actor_id': ev.actor_id,
            'notes': ev.notes,
            'meta': ev.meta,
            'created_at': ev.created_at,
        }
        for ev in events
    ]
