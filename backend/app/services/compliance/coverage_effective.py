from typing import Dict, List, Optional
from sqlalchemy.orm import Session
import importlib
from datetime import date

from app.constants.compliance import STATUS_VALUE, INHERITANCE_MULTIPLIER
from app.services.controls.effective_overlay import get_effective_controls

# Framework models (these names match your structure)
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.exception import ComplianceException
from app.models.risks.risk_scenario_context import RiskScenarioContext

from app.schemas.compliance.implementation_coverage import (
    ControlHit, RequirementImplementationCoverage, FrameworkImplementationCoverage
)



# --- locate ControlFrameworkMapping dynamically (no guessing required later) ---
def _load_mapping_model():
    CANDIDATE_IMPORTS = [
        "app.models.frameworks.control_framework_mapping",
        "app.models.compliance.control_framework_mapping",
        "app.models.controls.control_framework_mapping",
        "app.models.crosswalks.control_framework_mapping",
    ]
    for modpath in CANDIDATE_IMPORTS:
        try:
            mod = importlib.import_module(modpath)
            return getattr(mod, "ControlFrameworkMapping")
        except Exception:
            continue
    raise ImportError("ControlFrameworkMapping model not found. Please tell me its module path.")

ControlFrameworkMapping = _load_mapping_model()


def _derive_status(score: float, has_mappings: bool) -> str:
    """
    - unknown: no crosswalk mappings exist for the requirement
    - gap:     mappings exist but score == 0
    - partial: 0 < score < 0.99
    - met:     score >= 0.99
    """
    if not has_mappings:
        return "unknown"
    if score >= 0.99:
        return "met"
    if score > 0.0:
        return "partial"
    return "gap"


def _find_active_exception_id_for_req_in_scope(
    db, requirement_id: int, scope_type: str, scope_id: int
) -> Optional[int]:
    """Return the most recent active/approved exception id for this requirement within the given scope, if any."""
    today = date.today()
    q = (
        db.query(ComplianceException.id)
        .join(
            RiskScenarioContext,
            ComplianceException.risk_scenario_context_id == RiskScenarioContext.id,
        )
        .filter(
            RiskScenarioContext.scope_type == scope_type,
            RiskScenarioContext.scope_id == scope_id,
            ComplianceException.framework_requirement_id == requirement_id,
            ComplianceException.start_date <= today,
            ComplianceException.end_date >= today,
            ComplianceException.status.in_(["approved", "active"]),
        )
        .order_by(ComplianceException.updated_at.desc())
    )
    row = q.first()
    return row[0] if row else None


def _score_requirement(
    db,
    req,
    effective_by_ctrl: Dict[int, Dict],
    scope_type: str,
    scope_id: int,
):
    """
    Compute weighted score for a single requirement from effective controls,
    then derive status and exception flags.
    """
    # Load mapping model dynamically if this module uses a loader; otherwise import directly.
    try:
        ControlFrameworkMapping = _load_mapping_model()
    except NameError:
        from app.models.compliance.control_framework_mapping import ControlFrameworkMapping  # fallback

    mappings = list(
        db.query(ControlFrameworkMapping)
        .filter(ControlFrameworkMapping.framework_requirement_id == req.id)
        .all()
    )

    # No mappings -> unknown
    if not mappings:
        return RequirementImplementationCoverage(
            requirement_id=req.id,
            code=getattr(req, "code", str(req.id)),
            title=getattr(req, "title", None),
            score=0.0,
            hits=[],
            status="unknown",
            exception_applied=False,
            exception_id=None,
        )

    total_weight = sum(((getattr(m, "weight", None) or 100) for m in mappings)) or 1
    hits: List[ControlHit] = []
    total_score = 0.0

    for m in mappings:
        ctrl_id = getattr(m, "control_id")
        eff = effective_by_ctrl.get(ctrl_id)
        # If a mapped control has no effective implementation in scope, it contributes 0
        if not eff:
            continue

        assurance_status = eff.get("assurance_status")
        source = eff.get("source")
        inheritance_type = eff.get("inheritance_type")
        status_value = STATUS_VALUE.get(assurance_status, 0.0)
        inherit_mult = INHERITANCE_MULTIPLIER.get(inheritance_type, 1.0)

        weight = (getattr(m, "weight", None) or 100)
        weight_share = weight / total_weight
        contribution = round(status_value * inherit_mult * weight_share, 6)

        total_score += contribution
        hits.append(
            ControlHit(
                control_id=ctrl_id,
                source=source,
                assurance_status=assurance_status,
                inheritance_type=inheritance_type,
                weight_share=weight_share,
                contribution=contribution,
            )
        )

    # Clip to 1.0 to be safe
    total_score = min(round(total_score, 6), 1.0)

    # Check exception at requirement level for this scope
    exc_id = _find_active_exception_id_for_req_in_scope(db, req.id, scope_type, scope_id)
    if exc_id:
        # Exception = treated as compliant but clearly flagged
        status = "met"
        exception_applied = True
        # Many orgs count exceptions as covered; we set score to 1.0 here.
        total_score = 1.0
    else:
        status = _derive_status(total_score, has_mappings=True)
        exception_applied = False

    return RequirementImplementationCoverage(
        requirement_id=req.id,
        code=getattr(req, "code", str(req.id)),
        title=getattr(req, "title", None),
        score=total_score,
        hits=hits,
        status=status,
        exception_applied=exception_applied,
        exception_id=exc_id,
    )



def compute_version_effective_coverage(
    db: Session,
    version_id: int,
    scope_type: str,
    scope_id: int,
) -> FrameworkImplementationCoverage:
    # Effective controls index for the scope
    effective = get_effective_controls(db, scope_type, scope_id)
    effective_by_ctrl = {
        e.control_id: {
            "source": e.source,
            "assurance_status": e.assurance_status,
            "inheritance_type": e.inheritance_type,
        } for e in effective
    }

    reqs: List[FrameworkRequirement] = (
        db.query(FrameworkRequirement)
        .filter(FrameworkRequirement.framework_version_id == version_id)
        .order_by(FrameworkRequirement.sort_index.asc(), FrameworkRequirement.id.asc())
        .all()
    )

    req_cov: List[RequirementImplementationCoverage] = []
    total = 0.0
    count = 0
    for r in reqs:
        rc = _score_requirement(db, r, effective_by_ctrl,scope_type, scope_id)
        req_cov.append(rc)
        total += rc.score
        count += 1

    framework_score = round((total / count) if count else 0.0, 4)
    return FrameworkImplementationCoverage(
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        score=framework_score,
        requirements=req_cov,
    )
