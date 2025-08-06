from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.risks.risk_scenario import RiskScenario
from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.models.risks.risk_context_impact_rating import RiskContextImpactRating
from app.models.controls.control_effect_rating import ControlEffectRating


def calculate_risk_scores_by_scenario(db: Session, scenario_context_id: int) -> Dict[str, Any]:
    contexts = db.query(RiskScenarioContext).filter(
        RiskScenarioContext.risk_scenario_id == scenario_context_id
    ).all()

    if not contexts:
        return {
            "initial_score_avg": 0,
            "residual_score_avg": 0,
            "initial_score_max": 0,
            "residual_score_max": 0,
            "context_count": 0,
        }

    likelihoods = []
    max_impacts = []
    max_residuals = []

    for ctx in contexts:
        result = calculate_risk_scores_by_context(db, ctx.id)
        likelihoods.append(result["likelihood"])
        max_impacts.append(max(result["initial_by_domain"].values(), default=0))
        max_residuals.append(max(result["residual_by_domain"].values(), default=0))

    avg_likelihood = sum(likelihoods) / len(likelihoods)
    avg_impact = sum(max_impacts) / len(max_impacts)
    avg_residual_impact = sum(max_residuals) / len(max_residuals)

    return {
        "initial_score_avg": round(avg_likelihood * avg_impact, 2),
        "residual_score_avg": round(avg_likelihood * avg_residual_impact, 2),
        "initial_score_max": round(max(likelihoods) * max(max_impacts, default=0), 2),
        "residual_score_max": round(max(likelihoods) * max(max_residuals, default=0), 2),
        "context_count": len(contexts),
    }


def calculate_risk_scores_by_context(db: Session, context_id: int) -> Dict[str, Any]:
    context = db.query(RiskScenarioContext).filter(RiskScenarioContext.id == context_id).first()
    if not context:
        return {
            "initial_score": 0,
            "residual_score": 0,
            "likelihood": 0,
            "initial_by_domain": {},
            "residual_by_domain": {}
        }

    likelihood = context.likelihood or 0

    # Load impact ratings from context
    impact_ratings = db.query(RiskContextImpactRating).filter(
        RiskContextImpactRating.risk_scenario_context_id == context_id
    ).all()
    impact_map = {str(r.domain_id): r.score for r in impact_ratings}

    # Load control effectiveness from parent scenario
    control_effects = db.query(ControlEffectRating).filter(
        ControlEffectRating.risk_scenario_id == context.risk_scenario_id
    ).all()
    effect_map = {}
    for eff in control_effects:
        domain_key = str(eff.domain_id)
        existing = effect_map.get(domain_key, 0)
        effect_map[domain_key] = max(existing, eff.score or 0)

    # Calculate per-domain residuals
    residual_map = {}
    for domain_id, impact_score in impact_map.items():
        control_effect = effect_map.get(domain_id, 0)
        residual = max(0, impact_score - control_effect)
        residual_map[domain_id] = residual

    # Aggregate total initial and residual scores
    max_impact = max(impact_map.values(), default=0)
    max_residual = max(residual_map.values(), default=0)

    return {
        "initial_score": likelihood * max_impact,
        "residual_score": likelihood * max_residual,
        "likelihood": likelihood,
        "initial_by_domain": impact_map,
        "residual_by_domain": residual_map
    }

