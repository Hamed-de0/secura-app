# app/crud/m4/context_details_summaries.py
from __future__ import annotations
from typing import Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_evidence import ControlEvidence

def _freshness(today: date, captured_at: Optional[date], valid_until: Optional[date]) -> str:
    # Same policy as STEP 2
    if valid_until:
        left = (valid_until - today).days
        if left <= 0:   return "overdue"
        if left <= 90:  return "warn"
        return "ok"
    if not captured_at:
        return "overdue"
    age = (today - captured_at).days
    if age <= 90:   return "ok"
    if age <= 180:  return "warn"
    return "overdue"

def controls_summary_for_context(db: Session, context_id: int) -> Dict:
    # Counts by status (normalized with "proposed" for NULL)
    rows = (
        db.query(ControlContextLink.assurance_status, func.count(ControlContextLink.id))
          .filter(ControlContextLink.risk_scenario_context_id == context_id)
          .group_by(ControlContextLink.assurance_status)
          .all()
    )
    counts = {(k or "proposed"): int(v) for k, v in rows}

    # last evidence max across all links in this context
    last_ev = (
        db.query(func.max(ControlEvidence.collected_at))
          .select_from(ControlEvidence)
          .join(ControlContextLink, ControlContextLink.id == ControlEvidence.control_context_link_id)
          .filter(ControlContextLink.risk_scenario_context_id == context_id)
          .scalar()
    )

    return {
        "countsByStatus": counts,
        "coverageWeighted": None,  # not available on your link model yet
        "lastEvidenceMax": last_ev.isoformat() if last_ev else None,
    }

def evidence_summary_for_context(db: Session, context_id: int) -> Dict:
    # Pull relevant dates once (fast)
    q = (
        db.query(ControlEvidence.collected_at, ControlEvidence.valid_until)
          .join(ControlContextLink, ControlContextLink.id == ControlEvidence.control_context_link_id)
          .filter(ControlContextLink.risk_scenario_context_id == context_id)
    )
    today = datetime.utcnow().date()
    ok = warn = overdue = 0
    last_ev = None

    for collected_at, valid_until in q.all():
        f = _freshness(today, collected_at, valid_until)
        if f == "ok": ok += 1
        elif f == "warn": warn += 1
        else: overdue += 1
        if collected_at:
            last_ev = collected_at if (last_ev is None or collected_at > last_ev) else last_ev

    return {
        "ok": ok,
        "warn": warn,
        "overdue": overdue,
        "lastEvidenceMax": last_ev.isoformat() if last_ev else None,
    }
