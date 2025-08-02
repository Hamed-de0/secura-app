from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.risks.risk_scenario import RiskScenario
from app.models.risks.impact_rating import ImpactRating
from app.models.controls.control_effect_rating import ControlEffectRating


def calculate_risk_scores(db: Session, scenario_id: int) -> Dict[str, Any]:
    scenario = db.query(RiskScenario).filter(RiskScenario.id == scenario_id).first()
    if not scenario:
        return {
            "initial_score": 0,
            "residual_score": 0,
            "likelihood": 0,
            "initial_by_domain": {},
            "residual_by_domain": {}
        }

    likelihood = scenario.likelihood or 0

    # Fetch impact ratings
    impact_ratings = db.query(ImpactRating).filter(
        ImpactRating.scenario_id == scenario_id
    ).all()
    impact_map = {str(r.domain_id): r.score for r in impact_ratings}

    # Fetch control effect ratings
    control_effects = db.query(ControlEffectRating).filter(
        ControlEffectRating.risk_scenario_id == scenario_id
    ).all()
    effect_map = {}
    for eff in control_effects:
        domain_key = str(eff.domain_id)
        existing = effect_map.get(domain_key, 0)
        effect_map[domain_key] = max(existing, eff.score or 0)

    # Compute residual per domain
    residual_map = {}
    for domain_id, score in impact_map.items():
        control_effect = effect_map.get(domain_id, 0)
        residual_map[domain_id] = max(0, score - control_effect)

    max_impact = max(impact_map.values(), default=0)
    max_residual = max(residual_map.values(), default=0)

    return {
        "initial_score": likelihood * max_impact,
        "residual_score": likelihood * max_residual,
        "likelihood": likelihood,
        "initial_by_domain": impact_map,
        "residual_by_domain": residual_map
    }
