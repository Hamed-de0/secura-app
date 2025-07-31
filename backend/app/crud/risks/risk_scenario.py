from sqlalchemy.orm import Session
from app.models.risks.risk_scenario import RiskScenario
from app.models.assets.asset_tag import AssetTag
from app.models.risks.impact_rating import ImpactRating
from app.models.controls.control_risk_link import ControlRiskLink
from app.schemas.risks import RiskScenarioCreate, RiskScenarioUpdate
from typing import List, Optional

def create_risk_scenario(db: Session, data: RiskScenarioCreate) -> RiskScenario:
    scenario = RiskScenario(
        title_en=data.title_en,
        title_de=data.title_de,
        description_en=data.description_en,
        description_de=data.description_de,
        likelihood=data.likelihood,
        threat_id=data.threat_id,
        vulnerability_id=data.vulnerability_id,
        asset_id=data.asset_id,
        asset_group_id=data.asset_group_id,
        lifecycle_states=data.lifecycle_states,
        subcategory_id=data.subcategory_id
    )

    # Link tags
    if data.tag_ids:
        tags = db.query(AssetTag).filter(AssetTag.id.in_(data.tag_ids)).all()
        scenario.tags = tags

    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return scenario

def update_risk_scenario(db: Session, scenario_id: int, scenario_update: RiskScenarioUpdate):
    db_item = get_risk_scenario(db, scenario_id)
    if not db_item:
        return None
    update_data = scenario_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_risk_scenario(db: Session, scenario_id: int) -> Optional[RiskScenario]:
    return db.query(RiskScenario).filter(RiskScenario.id == scenario_id).first()

def get_risk_scenarios(db: Session, skip: int = 0, limit: int = 100) -> List[RiskScenario]:
    return db.query(RiskScenario).offset(skip).limit(limit).all()

def delete_risk_scenario(db: Session, scenario_id: int):
    db_item = get_risk_scenario(db, scenario_id)
    if not db_item:
        return None
    db.delete(db_item)
    db.commit()
    return db_item
