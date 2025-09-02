from typing import List, Optional, Dict, Any
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, select
from app.models.controls.control import Control
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping   # control_id, framework_requirement_id
from app.models.compliance.framework_requirement import FrameworkRequirement  # has framework_version_id?
from app.models.compliance.control_evidence import ControlEvidence  # has control_context_link_id, collected_at, status

def upsert_soa(
    db: Session,
    *,
    scope_type: str,
    scope_id: int,
    control_id: int,
    applicability: str,
    justification: str | None,
    approver: str | None,
    decided_at: date | None,
    expires_at: date | None,
    owner: str | None,
) -> ControlContextLink:
    link = (
        db.query(ControlContextLink)
        .filter(
            ControlContextLink.control_id == control_id,
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id,
        )
        .first()
    )
    if not link:
        link = ControlContextLink(
            control_id=control_id,
            scope_type=scope_type,
            scope_id=scope_id,
        )
        db.add(link)
        db.flush()

    link.applicability = applicability
    link.justification = justification
    link.approver = approver
    link.decided_at = decided_at
    link.expires_at = expires_at
    link.owner = owner

    db.commit()
    db.refresh(link)
    return link

def list_soa(
    db: Session,
    *,
    version_id: Optional[int],
    scope_type: str,
    scope_id: int,
) -> List[Dict[str, Any]]:
    """
    Return one row per control that is in scope for the given version (via crosswalks),
    enriched with link (SoA) fields and basic evidence aggregates.
    """
    # Controls relevant to version (via crosswalks -> framework_requirement -> version)
    ctrl_q = db.query(Control.id.label("control_id"), Control.reference_code.label("control_code"), Control.title_en)
    if version_id is not None:
        ctrl_q = (
            db.query(Control.id.label("control_id"), Control.reference_code.label("control_code"), Control.title_en)
            .join(ControlFrameworkMapping, ControlFrameworkMapping.control_id == Control.id)
            .join(FrameworkRequirement, FrameworkRequirement.id == ControlFrameworkMapping.framework_requirement_id)
            .filter(FrameworkRequirement.framework_version_id == version_id)
            .distinct()
        )

    controls = ctrl_q.all()
    if not controls:
        return []

    ctrl_ids = [c.control_id for c in controls]

    # Fetch existing links for scope
    links = (
        db.query(ControlContextLink)
        .filter(
            ControlContextLink.control_id.in_(ctrl_ids),
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id,
        )
        .all()
    )
    links_by_ctrl = {l.control_id: l for l in links}

    # Evidence aggregates per link
    # Only count evidence tied to the link; date = max(collected_at)
    ev_agg = {}
    if links:
        link_ids = [l.id for l in links]
        rows = (
            db.query(
                ControlEvidence.control_context_link_id,
                func.count(ControlEvidence.id),
                func.max(ControlEvidence.collected_at),
            )
            .filter(ControlEvidence.control_context_link_id.in_(link_ids))
            .group_by(ControlEvidence.control_context_link_id)
            .all()
        )
        id_by_ctrl = {l.id: l.control_id for l in links}
        for link_id, cnt, max_dt in rows:
            ev_agg[id_by_ctrl[link_id]] = (int(cnt or 0), max_dt)

    # (Optional) exceptions count per control (not scope-filtered here)
    from app.models.compliance.exception import ComplianceException
    ex_counts = {}
    rows = (
        db.query(ComplianceException.control_id, func.count(ComplianceException.id))
        .filter(ComplianceException.control_id.in_(ctrl_ids))
        .group_by(ComplianceException.control_id)
        .all()
    )
    for cid, cnt in rows:
        ex_counts[cid] = int(cnt or 0)

    # Build response
    out = []
    for c in controls:
        link = links_by_ctrl.get(c.control_id)
        cnt, last_dt = ev_agg.get(c.control_id, (0, None))
        out.append({
            "control_id": c.control_id,
            "control_code": c.control_code,
            "title": c.title_en,
            "applicability": getattr(link, "applicability", "applicable"),
            "justification": getattr(link, "justification", None),
            "approver": getattr(link, "approver", None),
            "decided_at": getattr(link, "decided_at", None),
            "expires_at": getattr(link, "expires_at", None),
            "owner": getattr(link, "owner", None),
            "evidence_count": cnt,
            "last_evidence_at": last_dt,
            "exceptions_count": ex_counts.get(c.control_id, 0),
        })
    return out
