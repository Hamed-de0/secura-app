
# =============================================
# app/api/compliance/obligations.py
# =============================================
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db  # or: from app.deps import get_db

from app.schemas.compliance.obligation_atom import (
    ObligationAtomCreate, ObligationAtomUpdate, ObligationAtomOut
)
from app.crud.compliance import obligation_atom as crud

router = APIRouter(prefix="/obligations", tags=["obligations"])


@router.get("/framework_requirements/{requirement_id}", response_model=List[ObligationAtomOut])
def list_obligations(requirement_id: int, db: Session = Depends(get_db)):
    return crud.list_by_requirement(db, requirement_id)


@router.post("/framework_requirements/{requirement_id}", response_model=ObligationAtomOut)
def create_obligation(requirement_id: int, payload: ObligationAtomCreate, db: Session = Depends(get_db)):
    if payload.framework_requirement_id != requirement_id:
        raise HTTPException(400, detail="framework_requirement_id mismatch")
    return crud.create(db, payload)


@router.get("/{atom_id}", response_model=ObligationAtomOut)
def get_obligation(atom_id: int, db: Session = Depends(get_db)):
    return crud.get(db, atom_id)


@router.put("/{atom_id}", response_model=ObligationAtomOut)
def update_obligation(atom_id: int, payload: ObligationAtomUpdate, db: Session = Depends(get_db)):
    return crud.update(db, atom_id, payload)


@router.delete("/{atom_id}", status_code=204)
def delete_obligation(atom_id: int, db: Session = Depends(get_db)):
    crud.delete(db, atom_id)
    return None

