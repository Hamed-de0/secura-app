import datetime
from typing import Dict, Any, Optional, List, Tuple, Set
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
from sqlalchemy import or_, and_

SPEC_SCOPES = {
    "asset", "asset_type", "asset_group", "tag",
    "bu", "site", "entity", "service", "org_group"
}


def _scope_pairs_for_asset(asset) -> Set[Tuple[str, int]]:
    """
    Build the set of (scope_type, scope_id) pairs that describe this asset.
    Works even if some relations/attributes are missing.
    """
    pairs: Set[Tuple[str, int]] = set()

    # asset
    aid = getattr(asset, "id", None)
    if aid: pairs.add(("asset", aid))

    # asset_type
    atid = getattr(asset, "type_id", None)
    if atid: pairs.add(("asset_type", atid))

    # groups (many-to-many)
    for g in (getattr(asset, "groups", []) or []):
        gid = getattr(g, "id", None)
        if gid: pairs.add(("asset_group", gid))

    # tags (many-to-many)
    for t in (getattr(asset, "tags", []) or []):
        tid = getattr(t, "id", None)
        if tid: pairs.add(("tag", tid))

    # business unit
    bu_id = getattr(asset, "business_unit_id", None) or getattr(getattr(asset, "business_unit", None), "id", None)
    if bu_id: pairs.add(("bu", bu_id))

    # entity / org entity
    ent = getattr(asset, "entity", None) or getattr(asset, "org_entity", None)
    ent_id = getattr(asset, "entity_id", None) or getattr(asset, "org_entity_id", None) or getattr(ent, "id", None)
    if ent_id: pairs.add(("entity", ent_id))

    # site
    site_id = getattr(asset, "site_id", None) or getattr(getattr(asset, "site", None), "id", None)
    if site_id: pairs.add(("site", site_id))

    # services (many-to-many)
    for s in (getattr(asset, "services", []) or []):
        sid = getattr(s, "id", None)
        if sid: pairs.add(("service", sid))

    # org_group (via entity, if present)
    og = getattr(ent, "org_group", None)
    og_id = getattr(ent, "org_group_id", None) or (getattr(og, "id", None) if og else None)
    if og_id: pairs.add(("org_group", og_id))

    return pairs


def policy_applies_to_asset(policy, asset) -> bool:
    """
    Unified policy check:
    - If policy.scope/scope_id is NULL → global policy (applies to all assets)
    - Else policy applies if its (scope, scope_id) matches any of the asset’s scope pairs.
    Legacy compatibility: still honors old p.asset_type_id / p.asset_group_id / p.asset_tag_id if present.
    """
    # Global (org-wide) policy: no scope restriction
    if getattr(policy, "scope", None) is None and getattr(policy, "scope_id", None) is None:
        return True

    asset_pairs = _scope_pairs_for_asset(asset)

    # New unified scope
    st = getattr(policy, "scope", None)
    sid = getattr(policy, "scope_id", None)
    if st in SPEC_SCOPES and sid is not None:
        return (st, sid) in asset_pairs

    # Legacy fallbacks (if you still have data in old columns)
    legacy_pairs = []
    if getattr(policy, "asset_type_id", None) is not None:
        legacy_pairs.append(("asset_type", policy.asset_type_id))
    if getattr(policy, "asset_group_id", None) is not None:
        legacy_pairs.append(("asset_group", policy.asset_group_id))
    if getattr(policy, "asset_tag_id", None) is not None:
        legacy_pairs.append(("tag", policy.asset_tag_id))

    return any(pair in asset_pairs for pair in legacy_pairs)

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
    return policy_applies_to_asset(asset=asset, policy=p)

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

