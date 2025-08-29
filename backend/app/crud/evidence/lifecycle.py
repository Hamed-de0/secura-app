from __future__ import annotations
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.compliance.control_evidence import ControlEvidence
from app.models.evidence.evidence_lifecycle_event import EvidenceLifecycleEvent
from app.models.controls.control_context_link import ControlContextLink
from datetime import timedelta


def write_event(db: Session, evidence_id: int, event: str, *, actor_id: Optional[int] = None, notes: Optional[str] = None, meta: Optional[Dict[str, Any]] = None) -> EvidenceLifecycleEvent:
    ev = EvidenceLifecycleEvent(
        evidence_id=evidence_id,
        event=event,
        actor_id=actor_id,
        notes=notes,
        meta=meta or {},
        created_at=datetime.utcnow(),
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


def soft_delete(db: Session, evidence_id: int) -> bool:
    row = db.query(ControlEvidence).get(evidence_id)
    if not row:
        return False
    row.lifecycle_status = 'retired'
    db.add(row)
    db.commit()
    write_event(db, evidence_id, 'retired')
    return True


def restore(db: Session, evidence_id: int) -> Optional[ControlEvidence]:
    row = db.query(ControlEvidence).get(evidence_id)
    if not row:
        return None
    row.lifecycle_status = 'active'
    db.add(row)
    db.commit(); db.refresh(row)
    write_event(db, evidence_id, 'restored')
    return row


def supersede(db: Session, evidence_id: int, replacement_id: int) -> Optional[ControlEvidence]:
    row = db.query(ControlEvidence).get(evidence_id)
    if not row:
        return None
    row.lifecycle_status = 'superseded'
    row.supersedes_id = replacement_id
    db.add(row)
    db.commit(); db.refresh(row)
    write_event(db, evidence_id, 'superseded', meta={'replacement_id': replacement_id})
    return row


def list_events(db: Session, evidence_id: int) -> List[EvidenceLifecycleEvent]:
    return (
        db.query(EvidenceLifecycleEvent)
        .filter(EvidenceLifecycleEvent.evidence_id == evidence_id)
        .order_by(EvidenceLifecycleEvent.created_at.desc())
        .all()
    )


def list_for_context(db: Session, context_id: int, *, days: int = 90, limit: Optional[int] = None, cursor: Optional[str] = None) -> List[EvidenceLifecycleEvent]:
    """Read-only helper: list lifecycle events for evidence linked to a context within a time window."""
    try:
        cutoff = datetime.utcnow() if days is None else (datetime.utcnow() - timedelta(days=max(1, int(days))))
    except Exception:
        cutoff = datetime.utcnow()
    q = (
        db.query(EvidenceLifecycleEvent)
          .join(ControlEvidence, ControlEvidence.id == EvidenceLifecycleEvent.evidence_id)
          .join(ControlContextLink, ControlContextLink.id == ControlEvidence.control_context_link_id)
          .filter(ControlContextLink.risk_scenario_context_id == context_id)
          .filter(EvidenceLifecycleEvent.created_at >= cutoff)
          .order_by(EvidenceLifecycleEvent.created_at.desc())
    )
    if limit and limit > 0:
        q = q.limit(int(limit))
    return q.all()
