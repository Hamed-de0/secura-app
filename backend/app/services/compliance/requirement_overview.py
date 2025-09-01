from __future__ import annotations
from typing import Iterable, List, Optional, Sequence, Dict, Set, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.common.datetime import iso_ts
from app.schemas.compliance.requirement_overview import (
    RequirementOverviewResponse, OverviewHeader, StatusSummary,
    UsageItem, MappingControl, MappingContext, EvidenceItem,
    ExceptionItem, TimelineEvent, OwnerItem, SuggestedControl
)
from app.services.compliance.status_engine import get_control_status

# --- Models ---
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.controls.control import Control
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.models.compliance.control_evidence import ControlEvidence
from app.models.evidence.evidence_lifecycle_event import EvidenceLifecycleEvent
from app.models.compliance.exception import ComplianceException
from app.models.compliance.requirement_owner import RequirementOwner

def _breadcrumbs_from_code(code: str) -> List[str]:
    if not code:
        return []
    parts = code.split(".")
    out = []
    for i in range(1, len(parts) + 1):
        out.append(".".join(parts[:i]))
    return out

class RequirementOverviewService:
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
        inc: Set[str] = set(include or ["usage", "mappings", "evidence", "exceptions", "lifecycle", "owners", "suggested_controls"])

        req: FrameworkRequirement = db.get(FrameworkRequirement, requirement_id)
        if not req:
            raise ValueError(f"Requirement {requirement_id} not found")

        header = OverviewHeader(
            id=req.id,
            code=req.code,
            title=getattr(req, "title", getattr(req, "name", "")),
            breadcrumbs=_breadcrumbs_from_code(req.code or ""),
        )

        # mapped controls
        control_rows = db.execute(
            select(Control.id, Control.reference_code, Control.title_en)
            .join(ControlFrameworkMapping, ControlFrameworkMapping.control_id == Control.id)
            .where(ControlFrameworkMapping.framework_requirement_id == requirement_id)
            .order_by(Control.reference_code.asc())
        ).all()
        control_ids = [cid for cid, _, _ in control_rows]

        # contexts
        ctx_stmt = select(
            ControlContextLink.id.label("link_id"),
            ControlContextLink.control_id,
            ControlContextLink.scope_type,
            ControlContextLink.scope_id,
        ).where(ControlContextLink.control_id.in_(control_ids or [0]))
        if scope_type:
            ctx_stmt = ctx_stmt.where(ControlContextLink.scope_type == scope_type)
        if scope_id is not None:
            ctx_stmt = ctx_stmt.where(ControlContextLink.scope_id == scope_id)
        ctx_rows = db.execute(ctx_stmt).all()

        link_ids: List[int] = [r.link_id for r in ctx_rows]
        ctx_by_control: Dict[int, List[Dict]] = {}
        for r in ctx_rows:
            ctx_by_control.setdefault(r.control_id, []).append(
                dict(context_link_id=r.link_id, scope_type=r.scope_type, scope_id=r.scope_id)
            )

        # evidence aggregates per link (count + last collected_at)
        ev_agg: Dict[int, Dict] = {}
        if link_ids:
            ev_rows = db.execute(
                select(
                    ControlEvidence.control_context_link_id.label("lk"),
                    func.count(ControlEvidence.id).label("cnt"),
                    func.max(ControlEvidence.collected_at).label("last_collected_at"),
                )
                .where(ControlEvidence.control_context_link_id.in_(link_ids))
                .group_by(ControlEvidence.control_context_link_id)
            ).all()
            for r in ev_rows:
                ev_agg[r.lk] = {"count": int(r.cnt or 0), "last_collected_at": r.last_collected_at}

        # usage
        usage: List[UsageItem] = []
        if "usage" in inc and ctx_rows:
            counts: Dict[str, int] = {}
            for r in ctx_rows:
                counts[r.scope_type] = counts.get(r.scope_type, 0) + 1
            usage = [UsageItem(scope_type=k, count=v) for k, v in sorted(counts.items())]

        # mappings (status from shared engine)
        mappings: List[MappingControl] = []
        if "mappings" in inc:
            for cid, ccode, ctitle in control_rows:
                contexts: List[MappingContext] = []
                for ctx in ctx_by_control.get(cid, []):
                    link_id = ctx["context_link_id"]
                    # canonical status
                    status = get_control_status(db, context_link_id=link_id)
                    agg = ev_agg.get(link_id, {})
                    contexts.append(MappingContext(
                        context_link_id=link_id,
                        scope_type=ctx["scope_type"],
                        scope_id=ctx["scope_id"],
                        status=status,
                        evidence_count=int(agg.get("count") or 0),
                        last_evidence_at=iso_ts(agg.get("last_collected_at")),
                    ))
                mappings.append(MappingControl(
                    control_id=cid,
                    control_code=ccode,
                    title=ctitle,
                    contexts=sorted(contexts, key=lambda x: (x.scope_type, x.scope_id))
                ))

        # evidence (flat)
        evidence: List[EvidenceItem] = []
        if "evidence" in inc and link_ids:
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
                )
                .where(ControlEvidence.control_context_link_id.in_(link_ids))
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
                    collected_at=iso_ts(r.collected_at),
                    valid_until=iso_ts(r.valid_until),
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
                getattr(ComplianceException, "created_at", None),
                getattr(ComplianceException, "updated_at", None),
            ).where(getattr(ComplianceException, "framework_requirement_id") == requirement_id)
            # if scope_type:
            #    exc_stmt = exc_stmt.where(getattr(ComplianceException, "scope_type") == scope_type)
            # if scope_id is not None:
            #    exc_stmt = exc_stmt.where(getattr(ComplianceException, "scope_id") == scope_id)
            for r in db.execute(exc_stmt.order_by(ComplianceException.id.desc())).all():
                exceptions.append(ExceptionItem(
                    id=r.id,
                    scope_type=getattr(r, "scope_type", None),
                    scope_id=getattr(r, "scope_id", None),
                    title=r.title,
                    reason=getattr(r, "reason", None),
                    status=getattr(r, "status", None),
                    expires_at=iso_ts(getattr(r, "expires_at", None)),
                ))

        # lifecycle: keep R1 shape (already adequate)
        lifecycle: List[TimelineEvent] = []
        if "lifecycle" in inc and evidence:
            ev_ids = [e.evidence_id for e in evidence]
            if ev_ids:
                lc_rows = db.execute(
                    select(
                        EvidenceLifecycleEvent.id,
                        EvidenceLifecycleEvent.evidence_id,
                        EvidenceLifecycleEvent.event,
                        EvidenceLifecycleEvent.created_at,
                        getattr(EvidenceLifecycleEvent, "actor", None),
                        getattr(EvidenceLifecycleEvent, "note", None),
                    ).where(EvidenceLifecycleEvent.evidence_id.in_(ev_ids))
                     .order_by(EvidenceLifecycleEvent.created_at.desc())
                ).all()
                for r in lc_rows:
                    lifecycle.append(TimelineEvent(
                        id=r.id,
                        ts=iso_ts(r.created_at) or "",
                        event=r.event,
                        actor=getattr(r, "actor", None),
                        note=getattr(r, "note", None),
                        evidence_id=r.evidence_id,
                    ))

        # status summary
        status_summary = StatusSummary()
        for m in mappings:
            for ctx in m.contexts:
                if hasattr(status_summary, ctx.status):
                    setattr(status_summary, ctx.status, getattr(status_summary, ctx.status) + 1)

        # owners (from R2)
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
                    name=None,
                    role=o.role
                ))

        # suggested controls (filled by R4 service if included; keep empty here)
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
