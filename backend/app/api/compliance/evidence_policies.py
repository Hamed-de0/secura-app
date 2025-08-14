from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.compliance.evidence_policy import EvidencePolicyCreate, EvidencePolicyUpdate, EvidencePolicyOut
from app.crud.compliance import evidence_policy as crud

router = APIRouter(prefix="/evidence_policies", tags=["Compliance - Evidence Policies"])

@router.post("", response_model=EvidencePolicyOut)
def create_policy(payload: EvidencePolicyCreate, db: Session = Depends(get_db)):
    try:
        return crud.create(db, payload)
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.patch("/{policy_id}", response_model=EvidencePolicyOut)
def update_policy(policy_id: int, payload: EvidencePolicyUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, policy_id, payload)
    if not obj:
        raise HTTPException(404, "Not found")
    return obj

@router.delete("/{policy_id}")
def delete_policy(policy_id: int, db: Session = Depends(get_db)):
    ok = crud.delete(db, policy_id)
    if not ok:
        raise HTTPException(404, "Not found")
    return {"deleted": ok}

@router.get("/by-control/{control_id}", response_model=Optional[EvidencePolicyOut])
def get_policy_by_control(control_id: int, db: Session = Depends(get_db)):
    return crud.get_by_control(db, control_id)

@router.get("/by-requirement/{framework_requirement_id}", response_model=Optional[EvidencePolicyOut])
def get_policy_by_requirement(framework_requirement_id: int, db: Session = Depends(get_db)):
    return crud.get_by_requirement(db, framework_requirement_id)
