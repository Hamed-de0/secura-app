from sqlalchemy.orm import Session
from app.models.risks.risk_scenario import RiskScenario
from app.schemas.risks import RiskScenarioCreate
from typing import List, Optional

def create_risk_scenario(db: Session, scenario_in: RiskScenarioCreate) -> RiskScenario:
    scenario = RiskScenario(**scenario_in.dict())
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return scenario

def get_risk_scenario(db: Session, scenario_id: int) -> Optional[RiskScenario]:
    return db.query(RiskScenario).filter(RiskScenario.id == scenario_id).first()

def get_risk_scenarios(db: Session, skip: int = 0, limit: int = 100) -> List[RiskScenario]:
    return db.query(RiskScenario).offset(skip).limit(limit).all()

def delete_risk_scenario(db: Session, scenario: RiskScenario) -> None:
    db.delete(scenario)
    db.commit()
