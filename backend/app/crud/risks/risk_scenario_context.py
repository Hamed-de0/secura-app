from sqlalchemy.orm import Session
from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.schemas.risks.risk_scenario_context import RiskScenarioContextCreate, RiskScenarioContextUpdate

def create_context(db: Session, obj_in: RiskScenarioContextCreate) -> RiskScenarioContext:
    obj = RiskScenarioContext(**obj_in.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_context(db: Session, context_id: int) -> RiskScenarioContext:
    return db.query(RiskScenarioContext).filter(RiskScenarioContext.id == context_id).first()

def get_all_contexts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RiskScenarioContext).offset(skip).limit(limit).all()

def update_context(db: Session, context_id: int, obj_in: RiskScenarioContextUpdate) -> RiskScenarioContext:
    db_obj = get_context(db, context_id)
    for field, value in obj_in.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_context(db: Session, context_id: int):
    db_obj = get_context(db, context_id)
    db.delete(db_obj)
    db.commit()
