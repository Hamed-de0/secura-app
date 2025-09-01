from __future__ import annotations
from typing import Set, Dict, List, Any
from datetime import datetime, date, time
import sqlalchemy as sa
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import ProgrammingError, OperationalError

from app.schemas.compliance.requirement_detail import (
    RequirementDetailResponse, RequirementBasic, StatusOut, MappingOut, EvidenceOut
)
from app.services.compliance.requirements_status_core import query_requirements_status_items
from app.services.compliance.requirements_status import valid_evidence_filters
# Models (names match your project structure)
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.models.controls.control import Control
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_evidence import ControlEvidence
from app.core.utils import _to_dt



def _control_status(db, *, control_id: int, scope_type: str, scope_id: int) -> str:
    """
    "met"    → at least one valid evidence for any CCL(control,scope)
    "gap"    → evidence exists for CCL but none valid (all expired)
    "unknown"→ no evidence and/or no CCL at this scope
    """
    # CCLs for this control at this scope
    ccl_ids_subq = (
        db.query(ControlContextLink.id)
          .filter(
              ControlContextLink.control_id == control_id,
              ControlContextLink.scope_type == scope_type,
              ControlContextLink.scope_id == scope_id,
          )
          .subquery()
    )

    # Any evidence rows tied to those CCLs?
    any_evidence = db.query(
        sa.exists().where(ControlEvidence.control_context_link_id.in_(select(ccl_ids_subq.c.id)))
    ).scalar()

    if not any_evidence:
        return "unknown"

    # Any *valid* evidence? (valid_until strictly in the future)
    has_valid = db.query(
        sa.exists().where(
            ControlEvidence.control_context_link_id.in_(select(ccl_ids_subq.c.id)),
            valid_evidence_filters()
            # ControlEvidence.valid_until.isnot(None),
            # ControlEvidence.valid_until > sa.func.now(),   # DB comparison; works for DATE or TIMESTAMP
        )
    ).scalar()

    return "met" if has_valid else "gap"


def _breadcrumb_from_code(code: str | None) -> str | None:
    return code if not code else code

def _single_status(
    db: Session, *, version_id: int, scope_type: str, scope_id: int, requirement_id: int
) -> StatusOut:
    page = query_requirements_status_items(
        db,
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        status=None,
        sort_by="code",
        sort_dir="asc",
        page=1,
        size=10_000,  # ensure we include the target item; adjust as needed
    )

    # Get the items list whether dict-like page or object
    items = page.get("items", []) if isinstance(page, dict) else getattr(page, "items", [])

    # Find the matching item (works for dicts or Pydantic models)
    def _get(attr: str, obj: Any):
        if isinstance(obj, dict):
            return obj.get(attr)
        # Pydantic v1 model or plain object
        return getattr(obj, attr, None)

    match = next((it for it in items if _get("requirement_id", it) == requirement_id), None)
    if not match:
        return StatusOut(status="unknown", score=0.0, exception_applied=False, computed_at=None)

    status_val = _get("status", match) or "unknown"
    score_val = _get("score", match) or 0
    exc_val = bool(_get("exception_applied", match) or False)

    return StatusOut(
        status=status_val,
        score=float(score_val),
        exception_applied=exc_val,
        computed_at=datetime.utcnow(),
    )


def _load_requirement(db: Session, requirement_id: int) -> RequirementBasic:
    r = (
        db.query(FrameworkRequirement.id, FrameworkRequirement.code, FrameworkRequirement.title)
        .filter(FrameworkRequirement.id == requirement_id)
        .one()
    )
    return RequirementBasic(
        requirement_id=r.id,
        code=r.code or "",
        title=r.title or "",
        breadcrumb=_breadcrumb_from_code(r.code),
    )

def _load_mappings_and_evidence(
    db: Session, *, requirement_id: int, scope_type: str, scope_id: int
) -> tuple[list[MappingOut], list[EvidenceOut]]:
    # Controls mapped to this requirement
    now = datetime.utcnow()
    mappings = (
        db.query(
            ControlFrameworkMapping.control_id.label("control_id"),
            Control.reference_code.label("control_code"),
            Control.title_en.label("control_title"),
        )
        .join(Control, Control.id == ControlFrameworkMapping.control_id)
        .filter(ControlFrameworkMapping.framework_requirement_id == requirement_id)
        .all()
    )

    control_ids = [m.control_id for m in mappings]
    if not control_ids:
        return [], []

    # Context links at this scope
    ccls = (
        db.query(
            ControlContextLink.id.label("id"),
            ControlContextLink.control_id.label("control_id"),
            ControlContextLink.scope_type.label("scope_type"),
            ControlContextLink.scope_id.label("scope_id"),
        )
        .filter(
            ControlContextLink.control_id.in_(control_ids),
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id,
        )
        .all()
    )
    by_control_ccl: Dict[int, int] = {c.control_id: c.id for c in ccls}
    link_ids = [c.id for c in ccls]

    # Evidence aggregates per context link
    ev_aggs: Dict[int, dict] = {}
    if link_ids:
        rows = (
            db.query(
                ControlEvidence.control_context_link_id.label("ccl_id"),
                func.count(ControlEvidence.id).label("cnt"),
                func.max(ControlEvidence.collected_at).label("last_at"),
            )
            .filter(ControlEvidence.control_context_link_id.in_(link_ids))
            .group_by(ControlEvidence.control_context_link_id)
            .all()
        )
        ev_aggs = {row.ccl_id: {"cnt": int(row.cnt), "last_at": row.last_at} for row in rows}

    mapping_out: List[MappingOut] = []
    for m in mappings:
        ccl_id = by_control_ccl.get(m.control_id)
        agg = ev_aggs.get(ccl_id or -1, {})
        mapping_out.append(
            MappingOut(
                control_id=m.control_id,
                control_code=m.control_code,
                control_title=m.control_title,
                context_link_id=ccl_id,
                link_scope_type=scope_type if ccl_id else None,
                link_scope_id=scope_id if ccl_id else None,
                # keep control_status optional; drawer shows status from the requirement summary row
                control_status=_control_status(db, control_id=m.control_id, scope_type=scope_type, scope_id=scope_id),
                evidence_count=int(agg.get("cnt") or 0),
                last_evidence_at=agg.get("last_at"),
            )
        )

    # Evidence list (flat)
    evidence_out: List[EvidenceOut] = []
    if link_ids:
        evidences = (
            db.query(
                ControlEvidence.id.label("id"),
                ControlEvidence.title.label("title"),
                ControlEvidence.evidence_type.label("evidence_type"),
                ControlEvidence.evidence_url.label("evidence_url"),
                ControlEvidence.file_path.label("file_path"),
                ControlEvidence.collected_at.label("collected_at"),
                ControlEvidence.valid_until.label("valid_until"),
            )
            .filter(ControlEvidence.control_context_link_id.in_(link_ids))
            .order_by(ControlEvidence.collected_at.desc().nullslast())
            .all()
        )
        now = datetime.utcnow()
        for e in evidences:
            status = None
            if e.valid_until:
                vu_dt = _to_dt(e.valid_until)
                status = "expired" if (vu_dt is not None and vu_dt < now) else "valid"
            evidence_out.append(
                EvidenceOut(
                    evidence_id=e.id,
                    title=e.title,
                    evidence_type=e.evidence_type,
                    evidence_url=e.evidence_url,
                    file_path=e.file_path,
                    collected_at=e.collected_at,
                    valid_until=e.valid_until,
                    status=status,
                )
            )

    return mapping_out, evidence_out

def get_detail(
    *,
    db: Session,
    version_id: int,
    scope_type: str,
    scope_id: int,
    requirement_id: int,
    include: Set[str],
) -> RequirementDetailResponse:
    req = _load_requirement(db, requirement_id)
    status = _single_status(db, version_id=version_id, scope_type=scope_type, scope_id=scope_id, requirement_id=requirement_id)

    mappings: List[MappingOut] = []
    evidence: List[EvidenceOut] = []
    if "mappings" in include or "evidence" in include:
        mappings, evidence = _load_mappings_and_evidence(
            db, requirement_id=requirement_id, scope_type=scope_type, scope_id=scope_id
        )

    return RequirementDetailResponse(
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        requirement=req,
        status=status,
        mappings=mappings if "mappings" in include else [],
        evidence=evidence if "evidence" in include else [],
        exceptions=[],
    )

# Optional lifecycle helper (used by router below)
def get_evidence_lifecycle(db: Session, evidence_id: int) -> list[dict]:
    try:
        # Import here so we don't error if the table/model doesn't exist in some environments
        from app.models.evidence.evidence_lifecycle_event import EvidenceLifecycleEvent
        rows = (
            db.query(
                EvidenceLifecycleEvent.event,
                EvidenceLifecycleEvent.actor_id,
                EvidenceLifecycleEvent.notes,
                EvidenceLifecycleEvent.meta,
                EvidenceLifecycleEvent.created_at,
            )
            .filter(EvidenceLifecycleEvent.evidence_id == evidence_id)
            .order_by(EvidenceLifecycleEvent.created_at.asc())
            .all()
        )
        return [
            dict(event=r.event, actor_id=r.actor_id, notes=r.notes, meta=r.meta, created_at=r.created_at)
            for r in rows
        ]
    except (ProgrammingError, OperationalError):
        # Table not present — return empty list gracefully
        db.rollback()
        return []
