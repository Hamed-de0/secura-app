from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.policies.risk_appetite_policy import (
    RiskAppetitePolicyCreate, RiskAppetitePolicyUpdate, RiskAppetitePolicyOut
)
from app.crud.policies import risk_appetite_policy as crud

router = APIRouter(prefix="/policies/appetite", tags=["Policies - Appetite"])

@router.get("", response_model=List[RiskAppetitePolicyOut])
def list_policies(db: Session = Depends(get_db)):
    return crud.list(db)

@router.post("", response_model=RiskAppetitePolicyOut)
def create_policy(payload: RiskAppetitePolicyCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.put("/{id}", response_model=RiskAppetitePolicyOut)
def update_policy(id: int, payload: RiskAppetitePolicyUpdate, db: Session = Depends(get_db)):
    row = crud.update(db, id, payload)
    if not row: raise HTTPException(404, "Not found")
    return row

@router.delete("/{id}")
def delete_policy(id: int, db: Session = Depends(get_db)):
    ok = crud.delete(db, id)
    if not ok: raise HTTPException(404, "Not found")
    return {"deleted": ok}
