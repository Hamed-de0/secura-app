from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.crud.risks import (
    create_risk_scenario,
    get_risk_scenario,
    get_risk_scenarios,
    delete_risk_scenario,
    read_grouped_risk_scenarios,
    get_categories_with_subcategories,
    update_risk_scenario
)
from app.schemas.risks import RiskScenarioCreate, RiskScenarioRead, RiskScenarioGrouped, RiskScenarioUpdate
from typing import Dict, Any
from app.services import calculate_risk_scores

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

@router.get("/manage/grouped", response_model=list[RiskScenarioGrouped])
def get_grouped_risk_scenarios(db: Session = Depends(get_db)):
    return read_grouped_risk_scenarios(db)

@router.get("/risk-scenario-categories/with-subcategories")
def get_all_with_subcategories(db: Session = Depends(get_db)):
    return get_categories_with_subcategories(db)

@router.put("/{scenario_id}")
def update_scenario(scenario_id: int, update_data: RiskScenarioUpdate, db: Session = Depends(get_db)):
    updated = update_risk_scenario(db, scenario_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Risk Scenario not found")
    return updated

@router.get("/risk-score/{scenario_id}", response_model=Dict[str, Any])
def get_risk_score(scenario_id: int, db: Session = Depends(get_db)):
    return calculate_risk_scores(db, scenario_id)