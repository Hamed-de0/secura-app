# app/crud/m4/context_controls.py
from __future__ import annotations
from typing import Tuple, List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.models.controls.control_context_link import ControlContextLink
from app.models.controls.control import Control
from app.models.compliance.control_evidence import ControlEvidence

def list_for_context(
    db: Session,
    context_id: int,
    *,
    offset: int = 0,
    limit: int = 50,
    sort_by: str = "status",      # status | last_evidence | code | title
    sort_dir: str = "asc",
    include_summary: bool = False,
) -> Tuple[int, List[Dict], Optional[Dict]]:
    """Return total, items, summary for controls linked to a risk context."""
    # Subquery: last evidence date per link
    ev_sub = (
        db.query(
            ControlEvidence.control_context_link_id.label("ccl_id"),
            func.max(ControlEvidence.collected_at).label("last_ev"),
        )
        .group_by(ControlEvidence.control_context_link_id)
        .subquery()
    )

    q = (
        db.query(
            ControlContextLink.id.label("id"),
            ControlContextLink.risk_scenario_context_id.label("ctx_id"),
            ControlContextLink.control_id.label("control_id"),
            ControlContextLink.assurance_status.label("status"),
            Control.reference_code.label("code"),
            func.coalesce(Control.title_en, Control.title_de).label("title"),
            ev_sub.c.last_ev.label("last_ev"),
        )
        .join(Control, Control.id == ControlContextLink.control_id)
        .outerjoin(ev_sub, ev_sub.c.ccl_id == ControlContextLink.id)
        .filter(ControlContextLink.risk_scenario_context_id == context_id)
    )

    desc = sort_dir.lower() == "desc"
    if sort_by == "last_evidence":
        q = q.order_by(ev_sub.c.last_ev.desc() if desc else ev_sub.c.last_ev.asc(),
                       ControlContextLink.id.desc())
    elif sort_by == "code":
        q = q.order_by(Control.reference_code.desc() if desc else Control.reference_code.asc())
    elif sort_by == "title":
        ttl = func.coalesce(Control.title_en, Control.title_de, "")
        q = q.order_by(ttl.desc() if desc else ttl.asc())
    else:
        q = q.order_by(ControlContextLink.assurance_status.desc() if desc else ControlContextLink.assurance_status.asc(),
                       ev_sub.c.last_ev.desc().nullslast())

    total = q.count()
    rows = q.offset(offset).limit(limit).all()

    items = [
        {
            "id": r.id,
            "contextId": r.ctx_id,
            "controlId": r.control_id,
            "code": r.code,
            "title": r.title,
            "status": (r.status or "proposed"),
            "lastEvidenceAt": r.last_ev,
        }
        for r in rows
    ]

    summary = None
    if include_summary:
        counts = dict(
            db.query(ControlContextLink.assurance_status, func.count(ControlContextLink.id))
              .filter(ControlContextLink.risk_scenario_context_id == context_id)
              .group_by(ControlContextLink.assurance_status)
              .all()
        )
        counts_norm = {(k or "proposed"): int(v) for k, v in counts.items()}

        last_max = (
            db.query(func.max(ev_sub.c.last_ev))
              .select_from(ControlContextLink)
              .outerjoin(ev_sub, ev_sub.c.ccl_id == ControlContextLink.id)
              .filter(ControlContextLink.risk_scenario_context_id == context_id)
              .scalar()
        )
        summary = {
            "countsByStatus": counts_norm,
            "lastEvidenceMax": last_max,
        }

    return total, items, summary


def create_link_simple(db: Session, context_id: int, control_id: int, status: str):
    """Minimal create wrapper: 409 if duplicate; returns created row."""
    exists = db.query(ControlContextLink.id).filter(
        ControlContextLink.risk_scenario_context_id == context_id,
        ControlContextLink.control_id == control_id
    ).first()
    if exists:
        return None, "duplicate"

    row = ControlContextLink(
        risk_scenario_context_id=context_id,
        control_id=control_id,
        assurance_status=status,
        status_updated_at=datetime.utcnow(),
    )
    db.add(row); db.commit(); db.refresh(row)
    return row, None


def update_link_status(db: Session, link_id: int, status: Optional[str]):
    row = db.query(ControlContextLink).get(link_id)
    if not row:
        return None, "not_found"
    changed = False
    if status is not None:
        row.assurance_status = status
        row.status_updated_at = datetime.utcnow()
        changed = True
    if changed:
        db.commit(); db.refresh(row)
    return row, None


def delete_link(db: Session, link_id: int) -> bool:
    row = db.query(ControlContextLink).get(link_id)
    if not row:
        return False
    db.delete(row); db.commit()
    return True
