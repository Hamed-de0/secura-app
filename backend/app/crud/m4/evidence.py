# app/crud/m4/evidence.py
from __future__ import annotations
from typing import Tuple, List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

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
    evidence_type: Optional[str] = None,   # NEW
    freshness: Optional[str] = None,       # NEW: ok|warn|overdue
    status: Optional[str] = None,          # lifecycle: active|retired|superseded|draft|all
    include_inactive: bool = False,
    offset: int = 0,
    limit: int = 50,
    sort_by: str = "captured_at",          # captured_at | valid_until
    sort_dir: str = "desc",
) -> Tuple[int, List[Dict], Dict[str, int]]:
    """
    Returns envelope for evidence items linked to links that belong to the given risk context.
    If 'freshness' filter is provided, total/summary reflect the filtered set.
    """
    q = (
        db.query(
            ControlEvidence.id,
            ControlEvidence.control_context_link_id,
            ControlEvidence.evidence_type,
            ControlEvidence.title,
            ControlEvidence.description,
            ControlEvidence.evidence_url,
            ControlEvidence.file_path,
            ControlEvidence.collected_at,
            ControlEvidence.valid_until,
            ControlEvidence.status,  # review status (legacy)
            ControlEvidence.lifecycle_status,
            ControlEvidence.supersedes_id,
            ControlContextLink.risk_scenario_context_id.label("ctx_id"),
            ControlContextLink.control_id.label("control_id"),
        )
        .join(ControlContextLink, ControlContextLink.id == ControlEvidence.control_context_link_id)
        .filter(ControlContextLink.risk_scenario_context_id == context_id)
    )
    if control_id is not None:
        q = q.filter(ControlContextLink.control_id == control_id)
    if evidence_type:
        q = q.filter(ControlEvidence.evidence_type == evidence_type)
    # Lifecycle filter (default active unless include_inactive is true or explicit status provided)
    if status and status != 'all':
        q = q.filter(ControlEvidence.lifecycle_status == status)
    elif not include_inactive:
        q = q.filter(ControlEvidence.lifecycle_status == 'active')

    # Pull raw rows (we'll compute freshness and apply that filter in-Python)
    rows = q.all()

    today = datetime.utcnow().date()
    items_all: List[Dict] = []
    for (eid, link_id, etype, title, descr, url, fpath, ca, vu, review_status, lifecycle_status, supersedes_id, ctx_id, ctrl_id) in rows:
        ref = url or fpath
        fr = _freshness(today, ca, vu)
        items_all.append({
            "id": eid,
            "contextId": ctx_id,
            "controlId": ctrl_id,
            "linkId": link_id,
            "type": etype or "other",
            "ref": ref,
            "capturedAt": ca,
            "validUntil": vu,
            "freshness": fr,
            "status": lifecycle_status,
            "supersedes_id": supersedes_id,
            # not exposed in Out, but available if you later extend:
            "_title": title,
            "_description": descr,
            "_review_status": review_status,
        })

    # Optional freshness filter (post-compute)
    if freshness in ("ok", "warn", "overdue"):
        items_all = [it for it in items_all if it["freshness"] == freshness]

    # Summary over the filtered set
    summary = {"ok": 0, "warn": 0, "overdue": 0}
    for it in items_all:
        summary[it["freshness"]] += 1

    # Sorting (Python to honor post-filtering)
    reverse = (sort_dir.lower() == "desc")
    if sort_by == "valid_until":
        items_all.sort(key=lambda it: (it["validUntil"] or date.min), reverse=reverse)
    else:
        items_all.sort(key=lambda it: (it["capturedAt"] or date.min), reverse=reverse)

    total = len(items_all)
    items = items_all[offset: offset + limit]

    return total, items, summary

# --- create_for_context stays as implemented previously ---
from urllib.parse import urlparse
import os

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
    title: str,
    ref: Optional[str],
    captured_at: Optional[date],
    valid_until: Optional[date],
    description: Optional[str] = None,
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
        title=_derive_title(title, ref, type),
        description=description,
        evidence_url=ref,
        collected_at=captured_at or datetime.utcnow().date(),
        valid_until=valid_until,
        status="valid",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row, None

def _ensure_evidence_in_context(db: Session, context_id: int, evidence_id: int) -> Optional[ControlEvidence]:
    """Return evidence row only if it belongs to a link inside the given context, else None."""
    return (
        db.query(ControlEvidence)
          .join(ControlContextLink, ControlContextLink.id == ControlEvidence.control_context_link_id)
          .filter(
              ControlEvidence.id == evidence_id,
              ControlContextLink.risk_scenario_context_id == context_id
          )
          .first()
    )

def update_in_context(
    db: Session,
    context_id: int,
    evidence_id: int,
    *,
    type: Optional[str] = None,
    title: Optional[str] = None,
    ref: Optional[str] = None,
    captured_at: Optional[date] = None,
    valid_until: Optional[date] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
):
    row = _ensure_evidence_in_context(db, context_id, evidence_id)
    if not row:
        return None, "not_found"

    changed = False
    if type is not None and type != row.evidence_type:
        row.evidence_type = type; changed = True
    if title is not None and title.strip() and title != row.title:
        row.title = title.strip(); changed = True
    if ref is not None and ref != row.evidence_url:
        row.evidence_url = ref; changed = True
    if captured_at is not None and captured_at != row.collected_at:
        row.collected_at = captured_at; changed = True
    if valid_until is not None and valid_until != row.valid_until:
        row.valid_until = valid_until; changed = True
    if description is not None and description != getattr(row, "description", None):
        row.description = description; changed = True
    if status is not None and status != row.status:
        row.status = status; changed = True

    if changed:
        row.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(row)
    return row, None

def delete_in_context(db: Session, context_id: int, evidence_id: int) -> bool:
    """Soft-delete (retire) evidence within this context.
    Returns False if evidence not in context.
    """
    row = _ensure_evidence_in_context(db, context_id, evidence_id)
    if not row:
        return False
    from app.crud.evidence import lifecycle as lc
    return lc.soft_delete(db, evidence_id)

def restore_in_context(db: Session, context_id: int, evidence_id: int):
    row = _ensure_evidence_in_context(db, context_id, evidence_id)
    if not row:
        return None
    from app.crud.evidence import lifecycle as lc
    return lc.restore(db, evidence_id)

def supersede_in_context(db: Session, context_id: int, evidence_id: int, replacement_id: int):
    row = _ensure_evidence_in_context(db, context_id, evidence_id)
    if not row:
        return None
    from app.crud.evidence import lifecycle as lc
    return lc.supersede(db, evidence_id, replacement_id)
