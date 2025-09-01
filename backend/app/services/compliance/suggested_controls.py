# app/services/compliance/suggested_controls.py
from __future__ import annotations
from typing import List, Optional, Tuple, Dict, Set
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import select, func, distinct, and_

from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.models.controls.control import Control
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_evidence import ControlEvidence

from app.schemas.compliance.requirement_overview import SuggestedControl

RECENT_DAYS = 180

def get_suggested_controls(
    db: Session,
    *,
    requirement_id: int,
    version_id: int,
    scope_type: Optional[str] = None,
    scope_id: Optional[int] = None,
    limit: int = 5,
) -> List[SuggestedControl]:
    """Suggest controls for a requirement using a simple heuristic:
       1) Controls mapped to sibling requirements (same parent) in the same framework version.
       2) Exclude controls already mapped to this requirement.
       3) Score by co-occurrence count, +boost if any evidence exists (recent evidence gets extra boost).
    """
    # 0) Load current requirement to find siblings
    req: FrameworkRequirement = db.get(FrameworkRequirement, requirement_id)
    if not req:
        return []

    # 1) Controls already mapped to the target requirement
    mapped_rows = db.execute(
        select(ControlFrameworkMapping.control_id)
        .where(ControlFrameworkMapping.framework_requirement_id == requirement_id)
    ).scalars().all()
    already_mapped: Set[int] = set(mapped_rows)

    # 2) Sibling requirements (share the same parent). If no parent, fallback to its children.
    sibling_ids: List[int] = []
    if req.parent_id:
        sibling_ids = db.execute(
            select(FrameworkRequirement.id)
            .where(
                FrameworkRequirement.parent_id == req.parent_id,
                FrameworkRequirement.id != requirement_id,
            )
        ).scalars().all()
    else:
        sibling_ids = db.execute(
            select(FrameworkRequirement.id)
            .where(FrameworkRequirement.parent_id == requirement_id)
        ).scalars().all()

    if not sibling_ids:
        # last fallback: peers at top level (same parent=None)
        sibling_ids = db.execute(
            select(FrameworkRequirement.id)
            .where(FrameworkRequirement.parent_id.is_(None), FrameworkRequirement.id != requirement_id)
        ).scalars().all()

    if not sibling_ids:
        return []

    # 3) Count how often controls appear on sibling requirements
    freq_rows = db.execute(
        select(
            ControlFrameworkMapping.control_id,
            func.count(distinct(ControlFrameworkMapping.framework_requirement_id)).label("cnt")
        ).where(ControlFrameworkMapping.framework_requirement_id.in_(sibling_ids))
         .group_by(ControlFrameworkMapping.control_id)
         .order_by(func.count(distinct(ControlFrameworkMapping.framework_requirement_id)).desc())
    ).all()

    # Candidate controls
    candidates: List[Tuple[int, int]] = [
        (r.control_id, int(r.cnt or 0))
        for r in freq_rows
        if r.control_id not in already_mapped
    ]
    if not candidates:
        return []

    cand_ids = [cid for cid, _ in candidates]

    # 4) Evidence boost: does the control have any evidence (optionally restricted to the given scope)
    # Aggregate per control: any evidence? and last collected_at
    ctx_stmt = select(
        ControlContextLink.id.label("link_id"),
        ControlContextLink.control_id,
    ).where(ControlContextLink.control_id.in_(cand_ids))
    if scope_type:
        ctx_stmt = ctx_stmt.where(ControlContextLink.scope_type == scope_type)
    if scope_id is not None:
        ctx_stmt = ctx_stmt.where(ControlContextLink.scope_id == scope_id)
    ctx_rows = db.execute(ctx_stmt).all()

    links_by_control: Dict[int, List[int]] = {}
    for r in ctx_rows:
        links_by_control.setdefault(r.control_id, []).append(r.link_id)

    ev_agg_by_control: Dict[int, Tuple[int, Optional[datetime]]] = {}
    all_links = [lid for lids in links_by_control.values() for lid in lids]
    if all_links:
        ev_rows = db.execute(
            select(
                ControlEvidence.control_context_link_id,
                func.count(ControlEvidence.id).label("cnt"),
                func.max(ControlEvidence.collected_at).label("last_collected_at"),
            )
            .where(ControlEvidence.control_context_link_id.in_(all_links))
            .group_by(ControlEvidence.control_context_link_id)
        ).all()
        # roll up link-level aggregates to control-level
        tmp: Dict[int, List[Tuple[int, Optional[datetime]]]] = {}
        link_to_control: Dict[int, int] = {lid: cid for cid, lids in links_by_control.items() for lid in lids}
        for r in ev_rows:
            cid = link_to_control.get(r.control_context_link_id)
            if cid is None:
                continue
            tmp.setdefault(cid, []).append((int(r.cnt or 0), r.last_collected_at))
        for cid, items in tmp.items():
            total = sum(c for c, _ in items)
            last = max((dt for _, dt in items if dt is not None), default=None)
            ev_agg_by_control[cid] = (total, last)

    # 5) Load control metadata
    controls = db.execute(
        select(Control.id, Control.reference_code, Control.title_en)
        .where(Control.id.in_(cand_ids))
    ).all()
    meta: Dict[int, Tuple[str, str]] = {r.id: (r.reference_code, r.title_en) for r in controls}

    # 6) Score candidates
    now = datetime.utcnow()
    out: List[Tuple[float, SuggestedControl]] = []
    for cid, freq in candidates:
        base = float(freq)
        ev_cnt, last_dt = ev_agg_by_control.get(cid, (0, None))
        if ev_cnt > 0:
            base += 0.25
        if last_dt and (now - last_dt) <= timedelta(days=RECENT_DAYS):
            base += 0.25

        code, title = meta.get(cid, ("", ""))
        reason_bits = [f"mapped in {freq} sibling reqs"]
        if ev_cnt > 0:
            reason_bits.append("has evidence")
        if last_dt and (now - last_dt) <= timedelta(days=RECENT_DAYS):
            reason_bits.append("recent evidence")
        reason = "; ".join(reason_bits)

        out.append((
            base,
            SuggestedControl(
                control_id=cid,
                control_code=code,
                title=title,
                reason=reason,
                score=round(base, 3),
            )
        ))

    out.sort(key=lambda t: (-t[0], t[1].control_code or ""))
    return [sc for _, sc in out[: max(1, limit)]]
