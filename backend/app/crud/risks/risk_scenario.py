from sqlalchemy.orm import Session, joinedload
from app.models.risks import RiskScenario, RiskScenarioCategory, RiskScenarioSubcategory
from app.models.assets import AssetTag
from app.models.risks.risk_context_impact_rating import RiskContextImpactRating
from app.models.controls.control_risk_link import ControlRiskLink
from app.schemas.risks import RiskScenarioCreate, RiskScenarioUpdate, RiskScenarioRead
from typing import List, Optional
# from models import RiskScenario, Threat, Vulnerability, Control, RiskScenarioControlLink

from app.models.risks.threat import Threat
from app.models.risks.vulnerability import Vulnerability
from app.models.controls.control import Control
from app.models.controls.control_risk_link import ControlRiskLink

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


def update_risk_scenario(db: Session, scenario_id: int, scenario_data: RiskScenarioUpdate) -> RiskScenario:
    db_item = db.query(RiskScenario).filter(RiskScenario.id == scenario_id).first()
    if not db_item:
        return None

    for field, value in scenario_data.dict(exclude_unset=True).items():
        setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)
    return db_item

def get_risk_scenario(db: Session, scenario_id: int) -> Optional[RiskScenarioRead]:
    scenario = (
        db.query(RiskScenario)
        .options(
            joinedload(RiskScenario.threat),
            joinedload(RiskScenario.vulnerability),
            joinedload(RiskScenario.asset),
            joinedload(RiskScenario.group),
            joinedload(RiskScenario.asset_tags),
            joinedload(RiskScenario.subcategory).joinedload(RiskScenarioSubcategory.category)
        )
        .filter(RiskScenario.id == scenario_id)
        .first()
    )

    if not scenario:
        return None

    # Convert to Pydantic schema and enrich fields
    # print(scenario)
    return RiskScenarioRead.from_orm(scenario).copy(update={
        "threat_name": scenario.threat.name if scenario.threat else None,
        "vulnerability_name": scenario.vulnerability.name if scenario.vulnerability else None,
        "asset_name": scenario.asset.name if scenario.asset else None,
        "group_name": scenario.group.name if scenario.group else None,
        "subcategory_name_en": scenario.subcategory.name_en if scenario.subcategory else None,
        "subcategory_name_de": scenario.subcategory.name_de if scenario.subcategory else None,
        "category_name_en": scenario.subcategory.category.name_en if scenario.subcategory and scenario.subcategory.category else None,
        "category_name_de": scenario.subcategory.category.name_de if scenario.subcategory and scenario.subcategory.category else None,
        "tag_names": [tag.name for tag in scenario.asset_tags],
    })

def get_risk_scenarios(db: Session, skip: int = 0, limit: int = 100) -> List[RiskScenario]:
    return db.query(RiskScenario).offset(skip).limit(limit).all()

def delete_risk_scenario(db: Session, scenario_id: int):
    db_item = get_risk_scenario(db, scenario_id)
    if not db_item:
        return None
    db.delete(db_item)
    db.commit()
    return db_item

def read_grouped_risk_scenarios(db: Session) -> List[dict]:
    categories = db.query(RiskScenarioCategory).all()
    result = []

    for category in categories:
        category_data = {
            "category_id": category.id,
            "category_name_de": category.name_de,
            "category_name_en": category.name_en,
            "subcategories": []
        }

        for sub in category.subcategories:
            scenarios = db.query(RiskScenario).filter(
                RiskScenario.subcategory_id == sub.id
            ).all()

            sub_data = {
                "subcategory_id": sub.id,
                "subcategory_name_de": sub.name_de,
                "subcategory_name_en": sub.name_en,
                "scenarios": [
                    {
                        "id": s.id,
                        "title_en": s.title_en,
                        "likelihood": s.likelihood,
                        "lifecycle_states": s.lifecycle_states,
                        "threat_id": s.threat_id,
                        "threat_name": s.threat.name if s.threat else None,
                        "vulnerability_id": s.vulnerability_id,
                        "vulnerability_name": s.vulnerability.name if s.vulnerability else None,
                        "asset_id": s.asset_id,
                        "asset_name": s.asset.name if s.asset else None,
                        "status": "Open"
                    }
                    for s in scenarios
                ]
            }

            category_data["subcategories"].append(sub_data)

        result.append(category_data)

    return result

def get_categories_with_subcategories(db: Session):
    categories = db.query(RiskScenarioCategory).all()
    return [
        {
            "id": cat.id,
            "name_en": cat.name_en,
            "name_de": cat.name_de,
            "subcategories": [
                {
                    "id": sub.id,
                    "name_en": sub.name_en,
                    "name_de": sub.name_de,
                }
                for sub in cat.subcategories
            ]
        }
        for cat in categories
    ]

def enrich_risk_scenario_from_reference_codes(
    db: Session,
    scenario_id: int,
    threat_id: Optional[str],
    vulnerability_id: Optional[str],
    controls: List[str]
):
    scenario = db.query(RiskScenario).get(scenario_id)
    if not scenario:
        raise ValueError("RiskScenario not found")

    if scenario.threat_id > 1 or scenario.vulnerability_id > 1:
        raise ValueError("Already did")

    # Look up threat
    if threat_id:
        threat = db.query(Threat).filter(Threat.reference_code == threat_id).first()
        if not threat:
            raise ValueError(f"Threat with code '{threat_id}' not found")
        scenario.threat_id = threat.id

    # Look up vulnerability
    if vulnerability_id:
        vuln = db.query(Vulnerability).filter(Vulnerability.reference_code == vulnerability_id).first()
        if not vuln:
            raise ValueError(f"Vulnerability with code '{vulnerability_id}' not found")
        scenario.vulnerability_id = vuln.id

    # Remove existing control links (optional if you want to replace them)
    db.query(ControlRiskLink).filter_by(risk_scenario_id=scenario_id).delete()

    # Link controls by reference code
    for code in controls:
        control = db.query(Control).filter(Control.reference_code == code).first()
        if not control:
            continue  # skip invalid codes silently or raise error
        link = ControlRiskLink(
            risk_scenario_id=scenario_id,
            control_id=control.id,
            effect_type="likelihood"  # or another field if needed
        )
        db.add(link)

    db.commit()
    return scenario

