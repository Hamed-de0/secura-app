from __future__ import annotations
from typing import List, Optional, Dict, Tuple, Set
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.schemas.compliance.timeline import UnifiedTimelineItem
# models
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.models.controls.control import Control
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_evidence import ControlEvidence
from app.models.evidence.evidence_lifecycle_event import EvidenceLifecycleEvent
from app.models.compliance.exception import ComplianceException

def _iso(dt) -> Optional[str]:
    if not dt: return None
    if isinstance(dt, str): return dt
    try: return dt.isoformat()
    except Exception: return str(dt)

def _safe_str(x) -> Optional[str]:
    try: return str(x) if x is not None else None
    except Exception: return None

class RequirementTimelineService:
    """
    Read-only unified timeline for a requirement, optionally scoped.
    Returns heterogeneous events from Evidence lifecycle, Exceptions, and Mappings.
    """

    @staticmethod
    def get_timeline(
        db: Session,
        *,
        requirement_id: int,
        version_id: int,
        scope_type: Optional[str] = None,
        scope_id: Optional[int] = None,
        limit: int = 200,
        page: int = 1,
        kinds: Optional[List[str]] = None,  # filter: ["evidence","exception","mapping"]
    ) -> List[UnifiedTimelineItem]:
        # Validate requirement exists
        req = db.get(FrameworkRequirement, requirement_id)
        if not req:
            return []

        kind_filter = set(kinds or ["evidence", "exception", "mapping"])

        # 1) controls mapped to this requirement
        mapped_control_ids = db.execute(
            select(ControlFrameworkMapping.control_id).where(
                ControlFrameworkMapping.framework_requirement_id == requirement_id
            )
        ).scalars().all()
        mapped_set: Set[int] = set(mapped_control_ids)
        if not mapped_set:
            mapped_set = set([-1])  # avoid empty IN()

        # 2) control metadata (code/title)
        control_meta = {}
        if mapped_set:
            rows = db.execute(
                select(Control.id, Control.reference_code, Control.title_en).where(
                    Control.id.in_(mapped_set)
                )
            ).all()
            control_meta = {r.id: (r.reference_code, r.title_en) for r in rows}

        # 3) context links (per-scope filter optional)
        ctx_stmt = select(
            ControlContextLink.id, ControlContextLink.control_id,
            ControlContextLink.scope_type, ControlContextLink.scope_id
        ).where(ControlContextLink.control_id.in_(mapped_set))
        if scope_type:
            ctx_stmt = ctx_stmt.where(ControlContextLink.scope_type == scope_type)
        if scope_id is not None:
            ctx_stmt = ctx_stmt.where(ControlContextLink.scope_id == scope_id)
        ctx_rows = db.execute(ctx_stmt).all()
        link_ids = [r.id for r in ctx_rows]
        link_to_ctx = {r.id: (r.control_id, r.scope_type, r.scope_id) for r in ctx_rows}

        events: List[UnifiedTimelineItem] = []

        # --- EVIDENCE LIFECYCLE ---
        if "evidence" in kind_filter and link_ids:
            # evidence by link ids
            ev_stmt = select(ControlEvidence.id, ControlEvidence.control_context_link_id)
            ev_stmt = ev_stmt.where(ControlEvidence.control_context_link_id.in_(link_ids))
            ev_rows = db.execute(ev_stmt).all()
            ev_ids = [r.id for r in ev_rows]
            ev_link = {r.id: r.control_context_link_id for r in ev_rows}

            if ev_ids:
                lc_stmt = select(
                    EvidenceLifecycleEvent.id,
                    EvidenceLifecycleEvent.evidence_id,
                    EvidenceLifecycleEvent.event,
                    EvidenceLifecycleEvent.created_at,
                    getattr(EvidenceLifecycleEvent, "actor", None),
                    getattr(EvidenceLifecycleEvent, "note", None),
                ).where(EvidenceLifecycleEvent.evidence_id.in_(ev_ids)).order_by(EvidenceLifecycleEvent.created_at.desc())
                lc_rows = db.execute(lc_stmt).all()
                for r in lc_rows:
                    link_id = ev_link.get(r.evidence_id)
                    c_id, s_type, s_id = link_to_ctx.get(link_id, (None, None, None))
                    c_code, _ = control_meta.get(c_id, (None, None))
                    summary = f"Evidence {r.event}"
                    events.append(UnifiedTimelineItem(
                        id=f"evid:{r.evidence_id}:{r.id}",
                        ts=_iso(r.created_at) or "",
                        kind="evidence",
                        subtype=str(r.event),
                        summary=summary,
                        actor=_safe_str(getattr(r, "actor", None)),
                        note=_safe_str(getattr(r, "note", None)),
                        requirement_id=requirement_id,
                        control_id=c_id,
                        control_code=c_code,
                        context_link_id=link_id,
                        evidence_id=r.evidence_id,
                        scope_type=s_type,
                        scope_id=s_id,
                    ))

        # --- EXCEPTIONS ---
        if "exception" in kind_filter:
            exc_stmt = select(
                ComplianceException.id,
                getattr(ComplianceException, "title", None),
                getattr(ComplianceException, "status", None),
                getattr(ComplianceException, "reason", None),
                getattr(ComplianceException, "scope_type", None),
                getattr(ComplianceException, "scope_id", None),
                getattr(ComplianceException, "created_at", None),
                getattr(ComplianceException, "updated_at", None),
                getattr(ComplianceException, "expires_at", None),
            ).where(getattr(ComplianceException, "framework_requirement_id") == requirement_id)
            # if scope_type:
            #     exc_stmt = exc_stmt.where(getattr(ComplianceException, "scope_type") == scope_type)
            # if scope_id is not None:
            #     exc_stmt = exc_stmt.where(getattr(ComplianceException, "scope_id") == scope_id)
            exc_rows = db.execute(exc_stmt).all()
            for r in exc_rows:
                # created
                if getattr(r, "created_at", None):
                    events.append(UnifiedTimelineItem(
                        id=f"exc:{r.id}:created",
                        ts=_iso(getattr(r, "created_at", None)) or "",
                        kind="exception",
                        subtype="created",
                        summary=f"Exception created: {getattr(r, 'title', '')}",
                        actor=None,
                        note=_safe_str(getattr(r, "reason", None)),
                        requirement_id=requirement_id,
                        exception_id=r.id,
                        scope_type=getattr(r, "scope_type", None),
                        scope_id=getattr(r, "scope_id", None),
                    ))
                # status change / update
                if getattr(r, "updated_at", None) and getattr(r, "updated_at", None) != getattr(r, "created_at", None):
                    events.append(UnifiedTimelineItem(
                        id=f"exc:{r.id}:updated",
                        ts=_iso(getattr(r, "updated_at", None)) or "",
                        kind="exception",
                        subtype="status_changed",
                        summary=f"Exception status: {getattr(r, 'status', '')}",
                        actor=None,
                        note=_safe_str(getattr(r, "reason", None)),
                        requirement_id=requirement_id,
                        exception_id=r.id,
                        scope_type=getattr(r, "scope_type", None),
                        scope_id=getattr(r, "scope_id", None),
                    ))
                # expired marker
                if getattr(r, "expires_at", None):
                    events.append(UnifiedTimelineItem(
                        id=f"exc:{r.id}:expires",
                        ts=_iso(getattr(r, "expires_at", None)) or "",
                        kind="exception",
                        subtype="expires_at",
                        summary="Exception expiration",
                        actor=None,
                        note=None,
                        requirement_id=requirement_id,
                        exception_id=r.id,
                        scope_type=getattr(r, "scope_type", None),
                        scope_id=getattr(r, "scope_id", None),
                    ))

        # --- MAPPINGS (Control ↔ Requirement) ---
        if "mapping" in kind_filter:
            # We emit 'added' using created_at if present, else skip
            map_stmt = select(
                ControlFrameworkMapping.control_id,
                getattr(ControlFrameworkMapping, "created_at", None),
            ).where(ControlFrameworkMapping.framework_requirement_id == requirement_id)
            map_rows = db.execute(map_stmt).all()
            for r in map_rows:
                ts = _iso(getattr(r, "created_at", None))
                if not ts:
                    continue  # don't invent timestamps
                code, _ = control_meta.get(r.control_id, (None, None))
                events.append(UnifiedTimelineItem(
                    id=f"map:{r.control_id}:added",
                    ts=ts,
                    kind="mapping",
                    subtype="added",
                    summary=f"Control mapped: {code or r.control_id}",
                    requirement_id=requirement_id,
                    control_id=r.control_id,
                    control_code=code,
                ))

        # Sort & paginate
        events.sort(key=lambda e: (e.ts or ""), reverse=True)
        if limit <= 0: limit = 50
        if page <= 0: page = 1
        start = (page - 1) * limit
        end = start + limit
        return events[start:end]
