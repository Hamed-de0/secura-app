from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.compliance.evidence import ControlEvidenceCreate, ControlEvidenceUpdate, ControlEvidenceOut
from app.crud.compliance import control_evidence as crud

router = APIRouter(prefix="/evidence", tags=["Compliance - Evidence"])

@router.post("", response_model=ControlEvidenceOut)
def add_evidence(payload: ControlEvidenceCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.get("/control/{link_id}", response_model=List[ControlEvidenceOut])
def list_evidence(link_id: int, db: Session = Depends(get_db)):
    return crud.list_by_link(db, link_id)

@router.patch("/{evidence_id}", response_model=ControlEvidenceOut)
def update_evidence(evidence_id: int, payload: ControlEvidenceUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, evidence_id, payload)
    if not obj:
        raise HTTPException(404, "Not found")
    return obj

@router.delete("/{evidence_id}")
def delete_evidence(evidence_id: int, db: Session = Depends(get_db)):
    ok = crud.delete(db, evidence_id)
    if not ok:
        raise HTTPException(404, "Not found")
    return {"deleted": ok}
