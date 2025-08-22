from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.schemas.policies.risk_appetite_policy import (
    RiskAppetitePolicyCreate, RiskAppetitePolicyUpdate, RiskAppetitePolicyOut
)
from app.crud.policies import risk_appetite_policy as crud

router = APIRouter(prefix="/policies/appetite", tags=["Policies - Appetite"])

@router.get("", response_model=List[RiskAppetitePolicyOut])
def list_policies(db: Session = Depends(get_db)):
    return crud.list_(db)

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

# NEW: get the effective policy for an asset (total or per-domain)
@router.get("/effective/asset/{asset_id}", response_model=Optional[RiskAppetitePolicyOut])
def get_effective_for_asset(
    asset_id: int,
    at_time: Optional[datetime] = Query(None),
    domain: Optional[str] = Query(None, description="C,I,A,L,R or omit for total"),
    db: Session = Depends(get_db),
):
    return crud.find_effective_for_asset(db, asset_id=asset_id, at_time=at_time, domain=domain)
