from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.risks.risk_scenario_context import (
    RiskScenarioContext,
    RiskScenarioContextCreate,
    RiskScenarioContextUpdate
)
from app.crud.risks import risk_scenario_context as crud
from app.database import get_db

router = APIRouter(prefix="/risk_scenario_contexts", tags=["Risk Scenario Contexts"])

@router.post("/", response_model=RiskScenarioContext)
def create_context(obj_in: RiskScenarioContextCreate, db: Session = Depends(get_db)):
    return crud.create_context(db, obj_in)

@router.get("/{context_id}", response_model=RiskScenarioContext)
def read_context(context_id: int, db: Session = Depends(get_db)):
    obj = crud.get_context(db, context_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Context not found")
    return obj

@router.get("/", response_model=list[RiskScenarioContext])
def read_all_contexts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all_contexts(db, skip=skip, limit=limit)

@router.put("/{context_id}", response_model=RiskScenarioContext)
def update_context(context_id: int, obj_in: RiskScenarioContextUpdate, db: Session = Depends(get_db)):
    return crud.update_context(db, context_id, obj_in)

@router.delete("/{context_id}")
def delete_context(context_id: int, db: Session = Depends(get_db)):
    crud.delete_context(db, context_id)
    return {"msg": "Deleted"}
