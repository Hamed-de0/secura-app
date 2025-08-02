from typing import Dict
from sqlalchemy.orm import Session
from app.models.risks.risk_scenario import RiskScenario
from app.models.risks.impact_rating import ImpactRating
from app.models.controls.control_effect_rating import ControlEffectRating


def calculate_risk_scores(db: Session, scenario_id: int) -> Dict[str, int]:
    scenario = db.query(RiskScenario).filter(RiskScenario.id == scenario_id).first()
    if not scenario:
        return {"initial_score": 0, "residual_score": 0}

    likelihood = scenario.likelihood or 0
    print('TEEEST')
    # Fetch impact ratings
    impact_ratings = db.query(ImpactRating).filter(ImpactRating.scenario_id == scenario_id).all()
    impact_map = {r.domain_id: r.score for r in impact_ratings}

    # Fetch control effect ratings
    control_effects = db.query(ControlEffectRating).filter(ControlEffectRating.risk_scenario_id == scenario_id).all()
    effect_map = {}
    for eff in control_effects:
        effect_map[eff.domain_id] = effect_map.get(eff.domain_id, 0) + (eff.score or 0)

    # Compute max impact and residual impact
    max_impact = max(impact_map.values(), default=0)
    residuals = [
        max(impact_map[domain_id] - effect_map.get(domain_id, 0), 0)
        for domain_id in impact_map
    ]
    max_residual = max(residuals, default=0)

    return {
        "initial_score": likelihood * max_impact,
        "residual_score": likelihood * max_residual
    }
