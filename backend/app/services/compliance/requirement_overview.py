from __future__ import annotations
from typing import Iterable, List, Optional, Sequence, Dict, Set, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, or_

from app.schemas.compliance.requirement_overview import (
    RequirementOverviewResponse, OverviewHeader, StatusSummary,
    UsageItem, MappingControl, MappingContext, EvidenceItem,
    ExceptionItem, TimelineEvent, OwnerItem, SuggestedControl
)

# --- Models (adjust imports if your paths differ) ---
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.controls.control import Control
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.models.compliance.control_evidence import ControlEvidence
from app.models.evidence.evidence_lifecycle_event import EvidenceLifecycleEvent
from app.models.compliance.exception import ComplianceException

from app.models.compliance.requirement_owner import RequirementOwner

from app.core.utils import _to_dt

# Utility: derive breadcrumbs from requirement code (e.g., "9.2.1" -> ["9","9.2","9.2.1"])
def _breadcrumbs_from_code(code: str) -> List[str]:
    if not code:
        return []
    parts = code.split(".")
    crumbs = []
    for i in range(1, len(parts) + 1):
        crumbs.append(".".join(parts[:i]))
    return crumbs


def _iso(dt) -> Optional[str]:
    if not dt:
        return None
    if isinstance(dt, str):
        return dt
    try:
        return dt.isoformat()
    except Exception:
        return str(dt)


def _status_from_counts(evidence_count: int, last_valid_until: Optional[datetime]) -> str:
    """
    Minimal heuristic until you plug your real status engine:
      - if evidence_count > 0 and (no valid_until or valid_until >= now): 'met'
      - else: 'unknown'
    """
    vu_dt = _to_dt(last_valid_until)
    if evidence_count and (last_valid_until is None or vu_dt >= datetime.utcnow()):
        return "met"
    return "unknown"


class RequirementOverviewService:
    """
    Read-only aggregator that composes requirement overview.
    """

    @staticmethod
    def get_overview(
        db: Session,
        *,
        requirement_id: int,
        version_id: int,
        scope_type: Optional[str] = None,
        scope_id: Optional[int] = None,
        include: Optional[List[str]] = None,
    ) -> RequirementOverviewResponse:
        inc: Set[str] = set((include or [
            "usage", "mappings", "evidence", "exceptions", "lifecycle", "owners", "suggested_controls"
        ]))

        # --- Header ---
        req: FrameworkRequirement = db.get(FrameworkRequirement, requirement_id)
        if not req:
            # let your API layer translate to 404
            raise ValueError(f"Requirement {requirement_id} not found")

        header = OverviewHeader(
            id=req.id,
            code=req.code,
            title=getattr(req, "title", getattr(req, "name", "")),
            breadcrumbs=_breadcrumbs_from_code(req.code or ""),
        )

        # Base mapping query: controls mapped to this requirement (framework version already implied by the req)
        mapped_controls = db.execute(
            select(Control.id, Control.reference_code, Control.title_en)
            .join(ControlFrameworkMapping, ControlFrameworkMapping.control_id == Control.id)
            .where(ControlFrameworkMapping.framework_requirement_id == requirement_id)
            .order_by(Control.reference_code.asc())
        ).all()
        control_rows: List[Tuple[int, str, str]] = list(mapped_controls)

        # Context links for those controls (optionally scoped)
        ctx_stmt = (
            select(
                ControlContextLink.id.label("context_link_id"),
                ControlContextLink.control_id,
                ControlContextLink.scope_type,
                ControlContextLink.scope_id,
            )
            .where(ControlContextLink.control_id.in_([cid for cid, _, _ in control_rows] or [0]))
        )
        if scope_type:
            ctx_stmt = ctx_stmt.where(ControlContextLink.scope_type == scope_type)
        if scope_id is not None:
            ctx_stmt = ctx_stmt.where(ControlContextLink.scope_id == scope_id)

        ctx_rows = db.execute(ctx_stmt).all()
        ctx_by_control: Dict[int, List[Dict]] = {}
        all_link_ids: List[int] = []
        for r in ctx_rows:
            all_link_ids.append(r.context_link_id)
            ctx_by_control.setdefault(r.control_id, []).append(
                dict(
                    context_link_id=r.context_link_id,
                    scope_type=r.scope_type,
                    scope_id=r.scope_id,
                )
            )

        # Evidence aggregates per context link
        ev_agg: Dict[int, Dict[str, Optional[datetime]]] = {}
        if all_link_ids:
            ev_rows = db.execute(
                select(
                    ControlEvidence.control_context_link_id.label("lk"),
                    func.count(ControlEvidence.id).label("cnt"),
                    func.max(ControlEvidence.valid_until).label("last_valid_until"),
                    func.max(ControlEvidence.collected_at).label("last_collected_at"),
                ).where(ControlEvidence.control_context_link_id.in_(all_link_ids))
                 .group_by(ControlEvidence.control_context_link_id)
            ).all()
            for r in ev_rows:
                ev_agg[r.lk] = {
                    "count": int(r.cnt or 0),
                    "last_valid_until": r.last_valid_until,
                    "last_collected_at": r.last_collected_at,
                }

        # usage
        usage: List[UsageItem] = []
        if "usage" in inc and ctx_rows:
            # count by scope_type
            counts: Dict[str, int] = {}
            for r in ctx_rows:
                counts[r.scope_type] = counts.get(r.scope_type, 0) + 1
            usage = [UsageItem(scope_type=k, count=v) for k, v in sorted(counts.items())]

        # mappings
        mappings: List[MappingControl] = []
        if "mappings" in inc:
            for cid, ccode, ctitle in control_rows:
                contexts: List[MappingContext] = []
                for ctx in ctx_by_control.get(cid, []):
                    agg = ev_agg.get(ctx["context_link_id"], {})
                    evidence_count = int(agg.get("count") or 0)
                    status = _status_from_counts(evidence_count, agg.get("last_valid_until"))
                    contexts.append(MappingContext(
                        context_link_id=ctx["context_link_id"],
                        scope_type=ctx["scope_type"],
                        scope_id=ctx["scope_id"],
                        status=status,  # placeholder logic
                        evidence_count=evidence_count,
                        last_evidence_at=_iso(agg.get("last_collected_at")),
                    ))
                mappings.append(MappingControl(
                    control_id=cid,
                    control_code=ccode,
                    title=ctitle,
                    contexts=sorted(contexts, key=lambda x: (x.scope_type, x.scope_id))
                ))

        # evidence (flat)
        evidence: List[EvidenceItem] = []
        if "evidence" in inc and all_link_ids:
            ev_rows_full = db.execute(
                select(
                    ControlEvidence.id,
                    ControlEvidence.title,
                    ControlEvidence.control_context_link_id,
                    getattr(ControlEvidence, "evidence_type", None),
                    getattr(ControlEvidence, "evidence_url", None),
                    getattr(ControlEvidence, "file_path", None),
                    ControlEvidence.collected_at,
                    ControlEvidence.valid_until,
                    getattr(ControlEvidence, "status", None),
                ).where(ControlEvidence.control_context_link_id.in_(all_link_ids))
                 .order_by(ControlEvidence.collected_at.desc().nullslast())
            ).all()
            for r in ev_rows_full:
                evidence.append(EvidenceItem(
                    evidence_id=r.id,
                    title=r.title,
                    control_context_link_id=r.control_context_link_id,
                    type=getattr(r, "evidence_type", None),
                    url=getattr(r, "evidence_url", None),
                    file_path=getattr(r, "file_path", None),
                    collected_at=_iso(r.collected_at),
                    valid_until=_iso(r.valid_until),
                    status=getattr(r, "status", None),
                ))

        # exceptions
        exceptions: List[ExceptionItem] = []
        if "exceptions" in inc:
            exc_stmt = select(
                ComplianceException.id,
                getattr(ComplianceException, "scope_type", None),
                getattr(ComplianceException, "scope_id", None),
                ComplianceException.title,
                getattr(ComplianceException, "reason", None),
                getattr(ComplianceException, "status", None),
                getattr(ComplianceException, "expires_at", None),
            ).where(getattr(ComplianceException, "framework_requirement_id") == requirement_id)
            if scope_type:
                exc_stmt = exc_stmt.where(getattr(ComplianceException, "scope_type") == scope_type)
            if scope_id is not None:
                exc_stmt = exc_stmt.where(getattr(ComplianceException, "scope_id") == scope_id)
            exc_rows = db.execute(exc_stmt.order_by(ComplianceException.id.desc())).all()
            for r in exc_rows:
                exceptions.append(ExceptionItem(
                    id=r.id,
                    scope_type=getattr(r, "scope_type", None),
                    scope_id=getattr(r, "scope_id", None),
                    title=r.title,
                    reason=getattr(r, "reason", None),
                    status=getattr(r, "status", None),
                    expires_at=_iso(getattr(r, "expires_at", None)),
                ))

        # lifecycle (unified -> simplified TimelineEvent used by Overview)
        lifecycle: List[TimelineEvent] = []
        if "lifecycle" in inc:
            from app.services.compliance.requirement_timeline import RequirementTimelineService
            uni = RequirementTimelineService.get_timeline(
                db,
                requirement_id=requirement_id,
                version_id=version_id,
                scope_type=scope_type,
                scope_id=scope_id,
                limit=50,  # a concise slice for overview
                page=1,
                kinds=["evidence", "exception", "mapping"],
            )
            for it in uni:
                # event text like "evidence:verified", "exception:status_changed", "mapping:added"
                ev_text = f"{it.kind}:{it.subtype}"
                lifecycle.append(TimelineEvent(
                    id=None,  # unified id is string; keep None to avoid type clash
                    ts=it.ts,
                    event=ev_text,
                    actor=it.actor,
                    note=it.note or it.summary,
                    evidence_id=it.evidence_id,
                ))


        # status summary (very light: count contexts by derived status)
        status_summary = StatusSummary()
        if "mappings" in inc:
            for m in mappings:
                for ctx in m.contexts:
                    k = getattr(status_summary, ctx.status, None)
                    if isinstance(k, int):
                        setattr(status_summary, ctx.status, k + 1)

        # owners (placeholder for R2)
        owners: List[OwnerItem] = []
        if "owners" in inc:
            q = select(RequirementOwner).where(RequirementOwner.framework_requirement_id == requirement_id)
            if scope_type:
                q = q.where(RequirementOwner.scope_type == scope_type)
            if scope_id is not None:
                q = q.where(RequirementOwner.scope_id == scope_id)
            for o in db.execute(q).scalars().all():
                owners.append(OwnerItem(
                    scope_type=o.scope_type,
                    scope_id=o.scope_id,
                    user_id=o.user_id,
                    name=None,  # populate when you have a users table
                    role=o.role
                ))

        # suggested controls (placeholder for R4)
        suggested_controls: List[SuggestedControl] = []
        if "suggested_controls" in inc:
            from app.services.compliance.suggested_controls import get_suggested_controls
            suggested_controls = get_suggested_controls(
                db,
                requirement_id=requirement_id,
                version_id=version_id,
                scope_type=scope_type,
                scope_id=scope_id,
                limit=5,
            )

        return RequirementOverviewResponse(
            header=header,
            status_summary=status_summary,
            usage=usage,
            mappings=mappings,
            evidence=evidence,
            exceptions=exceptions,
            lifecycle=lifecycle,
            owners=owners,
            suggested_controls=suggested_controls,
        )
