from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.crud.risks import (
    create_risk_scenario,
    get_risk_scenario,
    get_risk_scenarios,
    delete_risk_scenario
)
from app.schemas.risks import RiskScenarioCreate, RiskScenarioRead
from app.models.risks import RiskScenario

router = APIRouter(prefix="/risk-scenarios", tags=["Risk Scenarios"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=RiskScenarioRead)
def create(scenario_in: RiskScenarioCreate, db: Session = Depends(get_db)):
    return create_risk_scenario(db, scenario_in)

@router.get("/", response_model=list[RiskScenarioRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_risk_scenarios(db, skip, limit)

@router.get("/{scenario_id}", response_model=RiskScenarioRead)
def read(scenario_id: int, db: Session = Depends(get_db)):
    scenario = get_risk_scenario(db, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Risk Scenario not found")
    return scenario

@router.delete("/{scenario_id}")
def delete(scenario_id: int, db: Session = Depends(get_db)):
    scenario = get_risk_scenario(db, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Risk Scenario not found")
    delete_risk_scenario(db, scenario)
    return {"detail": "Deleted"}
