from __future__ import annotations
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

# Readers and models
from app.database import get_db
from app.crud.risks.risk_score import get_score_history_by_context
from app.models.evidence.evidence_lifecycle_event import EvidenceLifecycleEvent
from app.models.compliance.control_evidence import ControlEvidence
from app.models.controls.control_context_link import ControlContextLink


# Type alias for caller-friendly items (schema may formalize later)
ChangeItem = Dict[str, Any]


def _get_db_session() -> Session:
    """Obtain a DB session from the dependency generator (best-effort)."""
    try:
        gen = get_db()
        sess = next(gen)
        # We intentionally don't advance the generator to close here; callers of this
        # pure reader should be short-lived. If integrated elsewhere, prefer DI.
        return sess
    except Exception:  # pragma: no cover
        raise


def get_context_changes(
    context_id: int,
    days: int = 90,
    limit: int = 100,
    cursor: Optional[str] = None,
) -> Tuple[List[ChangeItem], Optional[str]]:
    """
    Merge residual score deltas with evidence lifecycle events for a context.
    - Residual deltas from RiskScoreHistory (overall + per-domain)
    - Evidence lifecycle from EvidenceLifecycleEvent joined via ControlEvidence -> ControlContextLink
    Returns items sorted by ts desc. Cursor is reserved (None for now).
    """
    db = _get_db_session()

    # Cutoff window
    now = datetime.utcnow()
    cutoff = now - timedelta(days=max(1, int(days or 0)))

    # 1) Residual score deltas
    score_items: List[ChangeItem] = []
    try:
        hist = get_score_history_by_context(db, context_id)
        # sort by created_at asc to compute forward diffs
        hist_sorted = sorted(list(hist or []), key=lambda h: getattr(h, "created_at", now))
        prev = None
        for h in hist_sorted:
            ts = getattr(h, "created_at", None)
            if ts is None or ts < cutoff:
                prev = h
                continue
            if prev is not None:
                # overall residual
                try:
                    p = float(getattr(prev, "residual_score", 0) or 0)
                    c = float(getattr(h, "residual_score", 0) or 0)
                    if p != c:
                        score_items.append({
                            "ts": ts,
                            "type": "residual",
                            "field": "residual",
                            "from": p,
                            "to": c,
                            "entityId": context_id,
                        })
                except Exception:
                    pass
                # per-domain residual
                try:
                    pr = getattr(prev, "residual_by_domain", {}) or {}
                    cr = getattr(h, "residual_by_domain", {}) or {}
                    for d in ("C", "I", "A", "L", "R"):
                        pv = float(pr.get(d, 0) or 0)
                        cv = float(cr.get(d, 0) or 0)
                        if pv != cv:
                            score_items.append({
                                "ts": ts,
                                "type": "residual",
                                "field": f"residual.{d}",
                                "from": pv,
                                "to": cv,
                                "entityId": context_id,
                            })
                except Exception:
                    pass
            prev = h
    except Exception:
        pass

    # 2) Evidence lifecycle events in this context
    ev_items: List[ChangeItem] = []
    try:
        q = (
            db.query(EvidenceLifecycleEvent)
            .join(ControlEvidence, ControlEvidence.id == EvidenceLifecycleEvent.evidence_id)
            .join(ControlContextLink, ControlContextLink.id == ControlEvidence.control_context_link_id)
            .filter(ControlContextLink.risk_scenario_context_id == context_id)
            .filter(EvidenceLifecycleEvent.created_at >= cutoff)
        )
        for ev in q.all() or []:
            ev_items.append({
                "ts": getattr(ev, "created_at", None) or now,
                "type": "evidence",
                "subtype": getattr(ev, "event", None),
                "entityId": getattr(ev, "evidence_id", None),
                "actor": getattr(ev, "actor_id", None),
                "notes": getattr(ev, "notes", None),
            })
    except Exception:
        pass

    # Merge and sort desc by timestamp
    merged: List[ChangeItem] = [*score_items, *ev_items]
    merged.sort(key=lambda it: it.get("ts") or now, reverse=True)

    if limit and limit > 0:
        merged = merged[: int(limit)]

    # Cursor: reserved for future paging (timestamp/id based)
    return merged, None

