# app/api/policies/framework_activation.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.policies.framework_activation_policy import (
    FrameworkActivationPolicyCreate,
    FrameworkActivationPolicyUpdate,
    FrameworkActivationPolicyOut,
)
from app.crud.policies import framework_activation_policy as crud

router = APIRouter(
    prefix="/policies/framework-activation",
    tags=["Policies - Framework Activation"],
)

@router.get("", response_model=List[FrameworkActivationPolicyOut])
def list_policies(
    active: bool = Query(False, description="Return only currently effective policies"),
    db: Session = Depends(get_db),
):
    return crud.list_active(db) if active else crud.list_active(db)  # list_all if you add it

@router.post("", response_model=FrameworkActivationPolicyOut)
def create_policy(payload: FrameworkActivationPolicyCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.put("/{id}", response_model=FrameworkActivationPolicyOut)
def update_policy(id: int, payload: FrameworkActivationPolicyUpdate, db: Session = Depends(get_db)):
    row = crud.update(db, id, payload)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return row

@router.delete("/{id}")
def delete_policy(id: int, db: Session = Depends(get_db)):
    ok = crud.delete(db, id)
    if not ok:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": ok}
