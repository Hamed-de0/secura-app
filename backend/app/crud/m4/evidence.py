# app/crud/m4/evidence.py
from __future__ import annotations
from typing import Tuple, List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from urllib.parse import urlparse
import os
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_evidence import ControlEvidence

def _freshness(today: date, captured_at: Optional[date], valid_until: Optional[date]) -> str:
    """
    Defaults:
      - If valid_until present:
          overdue if valid_until <= today
          warn    if 0 < (valid_until - today) <= 90
          ok      otherwise
      - Else fallback to captured_at age:
          ok   if age <= 90 days
          warn if age <= 180 days
          overdue otherwise or if captured_at is None
    """
    if valid_until:
        days_left = (valid_until - today).days
        if days_left <= 0:
            return "overdue"
        if days_left <= 90:
            return "warn"
        return "ok"

    if not captured_at:
        return "overdue"

    age_days = (today - captured_at).days
    if age_days <= 90:
        return "ok"
    if age_days <= 180:
        return "warn"
    return "overdue"

def list_by_context(
    db: Session,
    context_id: int,
    *,
    control_id: Optional[int] = None,
    offset: int = 0,
    limit: int = 50,
    sort_by: str = "captured_at",  # captured_at | valid_until
    sort_dir: str = "desc",
) -> Tuple[int, List[Dict], Dict[str, int]]:
    """
    Returns envelope for evidence items linked to links that belong to the given risk context.
    """
    q = (
        db.query(
            ControlEvidence.id,
            ControlEvidence.control_context_link_id,
            ControlEvidence.evidence_type,
            ControlEvidence.evidence_url,
            ControlEvidence.file_path,
            ControlEvidence.collected_at,
            ControlEvidence.valid_until,
            ControlContextLink.risk_scenario_context_id.label("ctx_id"),
            ControlContextLink.control_id.label("control_id"),
        )
        .join(ControlContextLink, ControlContextLink.id == ControlEvidence.control_context_link_id)
        .filter(ControlContextLink.risk_scenario_context_id == context_id)
    )
    if control_id is not None:
        q = q.filter(ControlContextLink.control_id == control_id)

    total = q.count()

    # Summary freshness over the whole filtered set
    today = datetime.utcnow().date()
    all_dates = q.with_entities(ControlEvidence.collected_at, ControlEvidence.valid_until).all()
    summary = {"ok": 0, "warn": 0, "overdue": 0}
    for ca, vu in all_dates:
        f = _freshness(today, ca, vu)
        summary[f] += 1

    # Sorting & paging
    desc = (sort_dir.lower() == "desc")
    if sort_by == "valid_until":
        q = q.order_by(ControlEvidence.valid_until.desc() if desc else ControlEvidence.valid_until.asc(),
                       ControlEvidence.id.desc())
    else:
        q = q.order_by(ControlEvidence.collected_at.desc() if desc else ControlEvidence.collected_at.asc(),
                       ControlEvidence.id.desc())

    rows = q.offset(offset).limit(limit).all()

    items: List[Dict] = []
    for (eid, link_id, etype, url, fpath, ca, vu, ctx_id, ctrl_id) in rows:
        ref = url or fpath
        items.append({
            "id": eid,
            "contextId": ctx_id,
            "controlId": ctrl_id,
            "linkId": link_id,
            "type": etype or "other",
            "ref": ref,
            "capturedAt": ca,
            "validUntil": vu,
            "freshness": _freshness(today, ca, vu),
        })

    return total, items, summary


def _derive_title(title: Optional[str], ref: Optional[str], typ: str) -> str:
    if title and title.strip():
        return title.strip()
    if ref:
        path = urlparse(ref).path if "://" in ref else ref
        base = os.path.basename(path) or path.strip("/")
        if base:
            return base
    return f"{(typ or 'evidence').capitalize()}"

def create_for_context(
    db: Session,
    context_id: int,
    *,
    control_id: int,
    type: str,
    title: str,                    # ← NEW
    ref: Optional[str],
    captured_at: Optional[date],
    valid_until: Optional[date],
    description: Optional[str] = None,   # ← NEW
):
    link = (
        db.query(ControlContextLink)
          .filter(ControlContextLink.risk_scenario_context_id == context_id,
                  ControlContextLink.control_id == control_id)
          .first()
    )
    if not link:
        return None, "link_not_found"

    row = ControlEvidence(
        control_context_link_id=link.id,
        evidence_type=type,
        title=_derive_title(title, ref, type),    # ← set title (not null)
        description=description,                  # ← optional
        evidence_url=ref,
        collected_at=captured_at or datetime.utcnow().date(),
        valid_until=valid_until,
        status="valid",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row, None



