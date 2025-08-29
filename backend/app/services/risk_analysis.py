from typing import Dict, Any, List, Optional
import os
from sqlalchemy.orm import Session, object_session
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


# ------------------------------------------------------------------------------------
# New helpers (pure, additive): residual with control-link gating and planned target
# ------------------------------------------------------------------------------------

def _residual_model_flag() -> str:
    """
    Returns the residual aggregation model from env/config.
    Allowed: 'max_e' (default), 'multiplicative'.
    """
    val = os.getenv("RISK_RESIDUAL_MODEL", "max_e")
    try:
        v = str(val or "").strip().lower()
    except Exception:
        v = "max_e"
    return v if v in {"max_e", "multiplicative"} else "max_e"


def _impact_map_for_context(ctx: RiskScenarioContext) -> Dict[str, float]:
    """Build {domain_id(str): impact_score(float)} from context's impact ratings."""
    ratings = getattr(ctx, "impact_ratings", None) or []
    out: Dict[str, float] = {}
    for r in ratings:
        try:
            key = str(getattr(r, "domain_id", getattr(r, "domain", None)))
            score = float(getattr(r, "score", 0) or 0)
            if key is not None:
                out[str(key)] = max(0.0, score)
        except Exception:
            continue
    return out


def _included_control_ids(ctx: RiskScenarioContext, *, mode: str) -> List[int]:
    """
    Returns list of control IDs included for the given mode.
    mode:
      - 'effective_only': ControlContextLink.assurance_status == 'effective' AND (if attribute exists) verification == 'operating'
      - 'planned': ControlContextLink.assurance_status in {'proposed','implemented','effective'}
    Uses ctx.control_links to avoid altering function signatures (pure helper).
    """
    links = getattr(ctx, "control_links", None) or []
    out: List[int] = []
    for link in links:
        try:
            st = str(getattr(link, "assurance_status", "") or "").strip().lower()
            cid = int(getattr(link, "control_id", 0) or 0)
            if cid <= 0:
                continue

            if mode == "effective_only":
                if st != "effective":
                    continue
                # Optional verification gate if attribute exists
                if hasattr(link, "verification"):
                    ver = str(getattr(link, "verification", "") or "").strip().lower()
                    if ver != "operating":
                        continue
                out.append(cid)
            elif mode == "planned":
                if st in {"proposed", "implemented", "effective"}:
                    out.append(cid)
        except Exception:
            continue
    return out


def _effects_by_domain_for_controls(db: Session, *, scenario_id: int, control_ids: List[int]) -> Dict[str, List[float]]:
    """
    Returns {domain_id(str): [effect_scores...]} for the included control ids under the scenario template
    using ControlEffectRating. Scores are coerced to 0..5 domain.
    """
    out: Dict[str, List[float]] = {}
    if not control_ids:
        return out
    rows = (
        db.query(ControlEffectRating)
        .filter(ControlEffectRating.risk_scenario_id == scenario_id)
        .filter(ControlEffectRating.control_id.in_(list(set(control_ids))))
        .all()
    )
    for r in rows:
        try:
            dom_key = str(getattr(r, "domain_id", None))
            if dom_key is None:
                continue
            score = float(getattr(r, "score", 0) or 0)
            # clamp to 0..5 to prevent bad data from exploding multiplicative model
            score = max(0.0, min(5.0, score))
            out.setdefault(dom_key, []).append(score)
        except Exception:
            continue
    return out


def _residual_by_domain(
    impacts: Dict[str, float],
    effects: Dict[str, List[float]],
    *,
    model: Optional[str] = None,
) -> Dict[str, float]:
    """
    Compute residual per-domain based on model.
    - max_e: residual = max(0, impact - max(E))
    - multiplicative: residual = round(impact * Π(1 - E/5), 2)
    Only domains present in impacts are returned to mirror existing behavior.
    """
    m = model or _residual_model_flag()
    out: Dict[str, float] = {}
    for dom, imp in impacts.items():
        try:
            imp_val = float(imp or 0)
            effs = effects.get(dom, [])
            if m == "multiplicative":
                # product over (1 - E/5)
                prod = 1.0
                for e in effs:
                    prod *= (1.0 - float(e) / 5.0)
                res = round(imp_val * max(0.0, prod), 2)
            else:
                e_max = max([float(e) for e in effs], default=0.0)
                res = max(0.0, imp_val - e_max)
            out[dom] = res
        except Exception:
            out[dom] = float(imp or 0)
    return out


def _overall_from_domains(residual_by_domain: Dict[str, float], likelihood: float) -> float:
    """Overall = likelihood × max(residual_by_domain)."""
    try:
        mx = max(residual_by_domain.values()) if residual_by_domain else 0.0
        return float(likelihood or 0) * float(mx)
    except Exception:
        return 0.0


def compute_residual_effective_only(context: RiskScenarioContext) -> Dict[str, Any]:
    """
    Compute residual considering ONLY effective control links for this context.
    - Include ControlContextLink with assurance_status='effective'.
    - If link has 'verification' attribute, also require verification='operating'.
    - Aggregate effects per domain via ControlEffectRating for the context's scenario.
    Returns: {
      'model': 'max_e' | 'multiplicative',
      'residual_by_domain': { domain_id(str): float },
      'overall': float  # likelihood × max(residual_by_domain)
    }
    Note: pure helper; assemblers (contexts list/details) can call this to expose
    optional fields without changing RiskScore semantics.
    """
    sess = object_session(context)
    if sess is None:
        # cannot compute without a session-bound context
        return {"model": _residual_model_flag(), "residual_by_domain": {}, "overall": 0.0}

    impacts = _impact_map_for_context(context)
    ctrl_ids = _included_control_ids(context, mode="effective_only")
    effects = _effects_by_domain_for_controls(sess, scenario_id=context.risk_scenario_id, control_ids=ctrl_ids)
    model = _residual_model_flag()
    residual_map = _residual_by_domain(impacts, effects, model=model)
    likelihood = float(getattr(context, "likelihood", 0) or 0)
    overall = _overall_from_domains(residual_map, likelihood)
    return {"model": model, "residual_by_domain": residual_map, "overall": overall}


def compute_target_residual_planned(context: RiskScenarioContext) -> Dict[str, Any]:
    """
    Compute target residual considering planned controls:
    - Include ControlContextLink with assurance_status IN ('proposed','implemented','effective').
    - Aggregate effects per domain via ControlEffectRating for the context's scenario.
    Returns same shape as compute_residual_effective_only().
    """
    sess = object_session(context)
    if sess is None:
        return {"model": _residual_model_flag(), "residual_by_domain": {}, "overall": 0.0}

    impacts = _impact_map_for_context(context)
    ctrl_ids = _included_control_ids(context, mode="planned")
    effects = _effects_by_domain_for_controls(sess, scenario_id=context.risk_scenario_id, control_ids=ctrl_ids)
    model = _residual_model_flag()
    residual_map = _residual_by_domain(impacts, effects, model=model)
    likelihood = float(getattr(context, "likelihood", 0) or 0)
    overall = _overall_from_domains(residual_map, likelihood)
    return {"model": model, "residual_by_domain": residual_map, "overall": overall}
