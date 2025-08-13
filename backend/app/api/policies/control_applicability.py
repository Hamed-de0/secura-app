from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.policies.control_applicability_policy import (
  ControlApplicabilityPolicyCreate, ControlApplicabilityPolicyUpdate, ControlApplicabilityPolicyOut
)
from app.crud.policies import control_applicability_policy as crud

router = APIRouter(prefix="/policies/control-applicability", tags=["Policies - Control Applicability"])

@router.get("", response_model=List[ControlApplicabilityPolicyOut])
def list_policies(db: Session = Depends(get_db)):
    return crud.list(db)

@router.post("", response_model=ControlApplicabilityPolicyOut)
def create_policy(payload: ControlApplicabilityPolicyCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.put("/{id}", response_model=ControlApplicabilityPolicyOut)
def update_policy(id: int, payload: ControlApplicabilityPolicyUpdate, db: Session = Depends(get_db)):
    row = crud.update(db, id, payload)
    if not row: raise HTTPException(404, "Not found")
    return row

@router.delete("/{id}")
def delete_policy(id: int, db: Session = Depends(get_db)):
    ok = crud.delete(db, id)
    if not ok: raise HTTPException(404, "Not found")
    return {"deleted": ok}
