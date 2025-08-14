from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Dict, List, Literal, Optional

from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping  # your crosswalk model
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_evidence import ControlEvidence
from app.models.compliance.evidence_policy import EvidencePolicy

AssuranceOrder = ["proposed","mapped","planning","implementing","implemented","monitoring","analyzing","evidenced","fresh","expired"]

def _best_status(a: str, b: str) -> str:
    # pick the "stronger" status
    ia = AssuranceOrder.index(a) if a in AssuranceOrder else 0
    ib = AssuranceOrder.index(b) if b in AssuranceOrder else 0
    return a if ia >= ib else b

def _freshness_for_link(db: Session, link: ControlContextLink, requirement_ids: List[int]) -> Optional[str]:
    """
    Returns 'fresh'|'expired'|None, based on evidence + policy (control-level overrides requirement-level).
    """
    # policy resolution: control policy first
    pol = db.query(EvidencePolicy).filter(EvidencePolicy.control_id == link.control_id).first()
    if not pol:
        # try any requirement-level policy that applies to this link (first match)
        pol = db.query(EvidencePolicy).filter(EvidencePolicy.framework_requirement_id.in_(requirement_ids)).first()
    if not pol:
        return None  # no policy -> don't override

    # get newest valid evidence for this link
    ev = (
        db.query(ControlEvidence)
        .filter(ControlEvidence.control_context_link_id == link.id, ControlEvidence.status == "valid")
        .order_by(ControlEvidence.collected_at.desc(), ControlEvidence.id.desc())
        .first()
    )
    if not ev:
        return None

    horizon = ev.collected_at + timedelta(days=pol.freshness_days)
    return "fresh" if date.today() <= horizon else "expired"

def compute_assurance_rollup(
    db: Session, framework_version_id: int, risk_scenario_context_id: int
) -> Dict:
    """
    For each requirement in the version, compute best status in given context, and summary counts.
    """
    reqs = db.query(FrameworkRequirement).filter(
        FrameworkRequirement.framework_version_id == framework_version_id
    ).all()

    # map: requirement_id -> control_ids
    rows = (
        db.query(ControlFrameworkMapping.framework_requirement_id, ControlFrameworkMapping.control_id)
        .join(FrameworkRequirement, FrameworkRequirement.id == ControlFrameworkMapping.framework_requirement_id)
        .filter(FrameworkRequirement.framework_version_id == framework_version_id)
        .all()
    )
    req_to_controls: Dict[int, List[int]] = {}
    for rid, cid in rows:
        req_to_controls.setdefault(rid, []).append(cid)

    # get all links in this context for those controls
    control_ids = list({cid for cids in req_to_controls.values() for cid in cids})
    links = []
    if control_ids:
        links = (
            db.query(ControlContextLink)
            .filter(
                ControlContextLink.risk_scenario_context_id == risk_scenario_context_id,
                ControlContextLink.control_id.in_(control_ids)
            ).all()
        )
    # index: control_id -> [links]
    ctl_to_links: Dict[int, List[ControlContextLink]] = {}
    for l in links:
        ctl_to_links.setdefault(l.control_id, []).append(l)

    # roll up per requirement
    per_requirement = []
    summary_counts: Dict[str, int] = {k: 0 for k in AssuranceOrder}

    for r in reqs:
        best = "mapped" if r.id in req_to_controls else "mapped"  # mapped if any mapping exists; else still mapped baseline
        cids = req_to_controls.get(r.id, [])

        for cid in cids:
            # evaluate all links of this control in the given context
            for lnk in ctl_to_links.get(cid, []):
                st = lnk.assurance_status or "proposed"
                # evaluate freshness override if status is evidenced/implemented or better
                if st in ("implemented","monitoring","analyzing","evidenced","fresh","expired"):
                    fres = _freshness_for_link(db, lnk, [r.id])
                    if fres == "fresh":
                        st = "fresh"
                    elif fres == "expired" and st != "fresh":
                        st = "expired"
                best = _best_status(best, st)

        per_requirement.append({
            "requirement_id": r.id,
            "code": r.code,
            "title": r.title,
            "best_status": best,
        })
        summary_counts[best] = summary_counts.get(best, 0) + 1

    total = len(reqs)
    return {
        "framework_version_id": framework_version_id,
        "context_id": risk_scenario_context_id,
        "total_requirements": total,
        "status_counts": summary_counts,
        "details": per_requirement
    }
