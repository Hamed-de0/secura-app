import datetime
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.orm import Session
from app.crud.policies.risk_appetite_policy import find_effective_for_asset
from app.crud.policies.control_applicability_policy import list_effective
from app.models.controls.control import Control  # adjust import to your project
from app.models.controls.control_risk_link import ControlRiskLink  # scenario template
from app.models.compliance.framework import Framework
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.crud.policies.framework_activation_policy import list_active as list_active_fw_policies
from datetime import datetime

def resolve_appetite(db: Session, *, asset) -> Optional[Dict[str, Any]]:
    p = find_effective_for_asset(db, asset_id=asset.id, at_time=datetime.utcnow(),domain=None)
    # p = resolve_for(db, asset=asset, scenario=None)
    if not p:
        return None
    return {
        "greenMax": p.green_max,
        "amberMax": p.amber_max,
        "domainCaps": p.domain_caps_json or {},
        "slaDays": {"amber": p.sla_days_amber, "red": p.sla_days_red},
        "_policy_id": p.id,  # helpful for debugging
    }

def compute_rag(residual: int, appetite: Dict[str, Any], *, likelihood: int, impacts: Dict[str, int]) -> str:
    # Base on thresholds
    if residual <= appetite["greenMax"]: rag = "Green"
    elif residual <= appetite["amberMax"]: rag = "Amber"
    else: rag = "Red"

    # Optional domain caps (V1 heuristic: domain residual ≈ likelihood * domain impact)
    caps = appetite.get("domainCaps") or {}
    for d, cap in caps.items():
        dom_val = (impacts.get(d, 0) or 0) * (likelihood or 0)
        if dom_val > cap:
            rag = "Red"; break
    return rag

def _asset_matches_policy(asset, p) -> bool:
    ok = True
    if p.asset_type_id is not None:  ok &= (asset.type_id == p.asset_type_id)
    if p.asset_tag_id is not None:   ok &= any(t.id == p.asset_tag_id for t in getattr(asset, "tags", []))
    if p.asset_group_id is not None: ok &= any(g.id == p.asset_group_id for g in getattr(asset, "groups", []))
    return ok

def get_required_controls(db: Session, *, asset, scenario_id: int) -> List[Control]:
    # 1) Scenario template controls
    tmpl_ids = [
        r.control_id for r in db.query(ControlRiskLink).filter(
            ControlRiskLink.risk_scenario_id == scenario_id
        ).all()
    ]
    required_ids = set(tmpl_ids)

    # 2) Baseline MSB sets from policies
    for p in list_effective(db):
        if p.set_type != "baseline":
            continue
        if _asset_matches_policy(asset, p):
            for cid in (p.controls_json or []):
                required_ids.add(cid)

    if not required_ids:
        return []

    # 3) Return canonical control rows (for names)
    return db.query(Control).filter(Control.id.in_(list(required_ids))).all()

def get_active_frameworks(db: Session, *, asset) -> List[Framework]:
    fw_ids = []
    for p in list_active_fw_policies(db):
        if _asset_matches_policy(asset, p):
            fw_ids.append(p.framework_id)
    if not fw_ids:
        return []
    return db.query(Framework).filter(Framework.id.in_(fw_ids)).all()

def build_compliance_chips(
    db: Session,
    *,
    asset,
    required_control_ids: List[int],
    implemented_control_ids: List[int],
) -> List[str]:
    chips: List[str] = []
    frameworks = get_active_frameworks(db, asset=asset)
    if not frameworks:
        return chips

    req_set = set(required_control_ids)
    impl_set = set(implemented_control_ids)

    for fw in frameworks:
        # all requirements for framework
        reqs = db.query(FrameworkRequirement).filter_by(framework_id=fw.id).all()
        if not reqs:
            continue
        # pre-fetch mappings for performance (optional micro-opt):
        # mapping by requirement id
        for r in reqs:
            maps = db.query(ControlFrameworkMapping).filter_by(framework_requirement_id=r.id).all()
            if not maps:
                continue
            # denominator: only mappings that intersect required controls
            denom = sum(m.weight or 0 for m in maps if m.control_id in req_set)
            if denom <= 0:
                # skip unmapped-to-required requirements to avoid noise
                continue
            num = sum(m.weight or 0 for m in maps if (m.control_id in req_set) and (m.control_id in impl_set))
            pct = int(round(100 * num / max(1, denom)))
            chips.append(f"{fw.name} {r.code} ({pct}%)")
    return chips

