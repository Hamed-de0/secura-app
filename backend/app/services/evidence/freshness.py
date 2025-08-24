from __future__ import annotations
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, or_

from app.models.controls.control_context_link import ControlContextLink

# Evidence-aware aggregate (uses EvidenceItem if present)
def evidence_aggregate_by_context(db: Session, ctx_ids: List[int], stale_before: datetime) -> Dict[int, Dict]:
    if not ctx_ids:
        return {}

    # Try evidence_items if available; otherwise fall back to status_updated_at
    EvidenceItem = None
    try:
        from app.models.evidence.evidence_item import EvidenceItem as EI
        EvidenceItem = EI
    except Exception:
        EvidenceItem = None

    if EvidenceItem:
        ev_latest_sub = (
            db.query(
                EvidenceItem.control_context_link_id.label("ccl_id"),
                func.max(
                    func.coalesce(EvidenceItem.reviewed_at, EvidenceItem.submitted_at)
                ).label("latest_ev")
            )
            .filter(EvidenceItem.status.in_(("submitted","accepted")))
            .group_by(EvidenceItem.control_context_link_id)
            .subquery()
        )

        rows = (
            db.query(
                ControlContextLink.risk_scenario_context_id.label("ctx"),
                func.sum(
                    case((func.lower(ControlContextLink.assurance_status).in_(("implemented","verified")), 1), else_=0)
                ).label("implemented"),
                func.sum(
                    case((
                        and_(
                            func.lower(ControlContextLink.assurance_status).in_(("implemented","verified")),
                            or_(
                                ev_latest_sub.c.latest_ev.is_(None),
                                ev_latest_sub.c.latest_ev < stale_before
                            )
                        ), 1), else_=0)
                ).label("overdue"),
                func.max(ev_latest_sub.c.latest_ev).label("max_evidence"),
            )
            .outerjoin(ev_latest_sub, ev_latest_sub.c.ccl_id == ControlContextLink.id)
            .filter(ControlContextLink.risk_scenario_context_id.in_(ctx_ids))
            .group_by(ControlContextLink.risk_scenario_context_id)
            .all()
        )
        out = {r.ctx: {"implemented": int(r.implemented or 0),
                       "overdue": int(r.overdue or 0),
                       "max_evidence": r.max_evidence} for r in rows}
        for cid in ctx_ids:
            out.setdefault(cid, {"implemented": 0, "overdue": 0, "max_evidence": None})
        return out

    # --- HOTFIX fallback: use status_updated_at when evidence_items not present ---
    rows = (
        db.query(
            ControlContextLink.risk_scenario_context_id.label("ctx"),
            func.sum(
                case((func.lower(ControlContextLink.assurance_status).in_(("implemented","verified")), 1), else_=0)
            ).label("implemented"),
            func.sum(
                case((
                    and_(
                        func.lower(ControlContextLink.assurance_status).in_(("implemented","verified")),
                        or_(
                            ControlContextLink.status_updated_at.is_(None),
                            ControlContextLink.status_updated_at < stale_before
                        )
                    ), 1), else_=0)
            ).label("overdue"),
            func.max(ControlContextLink.status_updated_at).label("max_evidence"),
        )
        .filter(ControlContextLink.risk_scenario_context_id.in_(ctx_ids))
        .group_by(ControlContextLink.risk_scenario_context_id)
        .all()
    )
    out = {r.ctx: {"implemented": int(r.implemented or 0),
                   "overdue": int(r.overdue or 0),
                   "max_evidence": r.max_evidence} for r in rows}
    for cid in ctx_ids:
        out.setdefault(cid, {"implemented": 0, "overdue": 0, "max_evidence": None})
    return out

# For a single context (used by /details)
def evidence_aggregate_for_context(db: Session, context_id: int, stale_before: datetime) -> Dict[str, Optional[int | datetime]]:
    data = evidence_aggregate_by_context(db, [context_id], stale_before)
    return data.get(context_id, {"implemented": 0, "overdue": 0, "max_evidence": None})
