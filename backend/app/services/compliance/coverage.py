from typing import Dict, List, Tuple
from sqlalchemy.orm import Session

from app.constants.compliance import STATUS_VALUE, INHERITANCE_MULTIPLIER
from app.services.controls.effective_overlay import get_effective_controls

from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping

from app.schemas.compliance.implementation_coverage import (
    ControlHit, RequirementImplementationCoverage, FrameworkImplementationCoverage
)

from .coverage_effective import _score_requirement

def _score_requirement_old(
    db: Session,
    req: FrameworkRequirement,
    effective_by_ctrl: Dict[int, dict],

) -> RequirementImplementationCoverage:
    mappings: List[ControlFrameworkMapping] = (
        db.query(ControlFrameworkMapping)
        .filter(ControlFrameworkMapping.framework_requirement_id == req.id)
        .all()
    )
    if not mappings:
        return RequirementImplementationCoverage(
            requirement_id=req.id, code=req.code, title=req.title, score=0.0, hits=[]
        )

    total_weight = sum((m.weight or 100) for m in mappings) or 1
    hits: List[ControlHit] = []
    total_score = 0.0

    for m in mappings:
        eff = effective_by_ctrl.get(m.control_id)
        if not eff:
            continue
        status_val = STATUS_VALUE.get(eff["assurance_status"], 0.0)
        inherit_mult = INHERITANCE_MULTIPLIER.get(eff.get("inheritance_type"), 1.0)
        share = (m.weight or 100) / total_weight
        contrib = share * status_val * inherit_mult
        if contrib <= 0:
            continue
        total_score += contrib
        hits.append(ControlHit(
            control_id=m.control_id,
            source=eff["source"],
            assurance_status=eff["assurance_status"],
            inheritance_type=eff.get("inheritance_type"),
            weight_share=round(share, 4),
            contribution=round(contrib, 4),
        ))

    total_score = min(1.0, total_score)
    return RequirementImplementationCoverage(
        requirement_id=req.id,
        code=req.code,
        title=req.title,
        score=round(total_score, 4),
        hits=hits,
    )

def compute_version_effective_coverage(
    db: Session,
    version_id: int,
    scope_type: str,
    scope_id: int,
) -> FrameworkImplementationCoverage:
    # Build effective controls index for the scope
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
        .order_by(FrameworkRequirement.sort_order.asc(), FrameworkRequirement.id.asc())
        .all()
    )

    req_cov: List[RequirementImplementationCoverage] = []
    total = 0.0
    count = 0
    for r in reqs:
        rc = _score_requirement(db, r, effective_by_ctrl, scope_type, scope_id)
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
