from typing import Dict, List
from sqlalchemy.orm import Session
import importlib

from app.constants.compliance import STATUS_VALUE, INHERITANCE_MULTIPLIER
from app.services.controls.effective_overlay import get_effective_controls

# Framework models (these names match your structure)
from app.models.compliance.framework_requirement import FrameworkRequirement

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


from app.schemas.compliance.implementation_coverage import (
    ControlHit, RequirementImplementationCoverage, FrameworkImplementationCoverage
)

def _score_requirement(
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
            requirement_id=req.id, code=req.code, title=getattr(req, "title", None), score=0.0, hits=[]
        )

    total_weight = sum((getattr(m, "weight", None) or 100) for m in mappings) or 1
    hits: List[ControlHit] = []
    total_score = 0.0

    for m in mappings:
        ctrl_id = getattr(m, "control_id")
        eff = effective_by_ctrl.get(ctrl_id)
        if not eff:
            continue
        status_val = STATUS_VALUE.get(eff["assurance_status"], 0.0)
        inherit_mult = INHERITANCE_MULTIPLIER.get(eff.get("inheritance_type"), 1.0)
        share = (getattr(m, "weight", None) or 100) / total_weight
        contrib = share * status_val * inherit_mult
        if contrib <= 0:
            continue
        total_score += contrib
        hits.append(ControlHit(
            control_id=ctrl_id,
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
        title=getattr(req, "title", None),
        score=round(total_score, 4),
        hits=hits,
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
        rc = _score_requirement(db, r, effective_by_ctrl)
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
