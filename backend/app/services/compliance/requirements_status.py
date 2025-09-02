# requirements_status.py

from typing import List, Optional, Dict, Tuple, Set
from datetime import datetime, timezone
from sqlalchemy import select, func, distinct, or_, and_
from sqlalchemy.orm import Session
from sqlalchemy.inspection import inspect as sa_inspect

from app.schemas.compliance.requirements_status import (
    RequirementsStatusPage,
    RequirementStatusItem,
)
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_evidence import ControlEvidence


def _now_utc():
    try:
        return datetime.now(timezone.utc)
    except Exception:
        return datetime.utcnow()


def valid_evidence_filters(now_db=None):
    """
    Reusable SQLAlchemy predicates for 'valid evidence'.
    We standardize on DB time (func.now()) to avoid date vs datetime issues.
    """
    now_db = now_db or func.now()
    filters = [ControlEvidence.status == "valid"]
    # If your schema has these columns, include time bounds; otherwise they’re ignored by SQLA.
    if hasattr(ControlEvidence, "valid_from"):
        filters.append(or_(ControlEvidence.valid_from.is_(None), ControlEvidence.valid_from <= now_db))
    if hasattr(ControlEvidence, "valid_until"):
        filters.append(or_(ControlEvidence.valid_until.is_(None), ControlEvidence.valid_until >= now_db))
    return and_(*filters)


def _try_pick_col(model, *preferred, endswith: Optional[str] = None, contains: Optional[list[str]] = None):
    cols = {c.key for c in sa_inspect(model).columns}
    for name in preferred:
        if name and name in cols:
            return getattr(model, name)
    if endswith:
        for k in cols:
            if k.endswith(endswith):
                return getattr(model, k)
    if contains:
        for k in cols:
            if all(token in k for token in contains):
                return getattr(model, k)
    return None


def _required_col(model, *candidates, **kw):
    col = _try_pick_col(model, *candidates, **kw)
    if col is None:
        have = sorted(c.key for c in sa_inspect(model).columns)
        raise RuntimeError(f"{model.__name__}: cannot find a matching column among {have}")
    return col


def _load_req_meta(db: Session, version_id: int) -> Dict[int, Dict]:
    rows = (
        db.query(
            FrameworkRequirement.id,
            FrameworkRequirement.code,
            FrameworkRequirement.title,
            FrameworkRequirement.parent_id,
            FrameworkRequirement.sort_index,
        )
        .filter(FrameworkRequirement.framework_version_id == version_id)
        .all()
    )
    return {
        r.id: {
            "code": r.code,
            "title": r.title,
            "parent_id": r.parent_id,
            "sort_index": r.sort_index,
        }
        for r in rows
    }


def _compute_path(meta_by_id: Dict[int, Dict], req_id: int, _cache: Dict[int, Tuple[List[int], List[str]]]):
    if req_id in _cache:
        return _cache[req_id]
    ids_rev, codes_rev, seen = [], [], set()
    cur = req_id
    while cur and cur in meta_by_id and cur not in seen:
        seen.add(cur)
        m = meta_by_id[cur]
        ids_rev.append(cur)
        codes_rev.append(m.get("code") or str(cur))
        cur = m.get("parent_id")
    ids_path = list(reversed(ids_rev))
    codes_path = list(reversed(codes_rev))
    _cache[req_id] = (ids_path, codes_path)
    return ids_path, codes_path


def list_requirements_status(
    db: Session,
    version_id: int,
    scope_type: str,
    scope_id: int,
    q: Optional[str] = None,
    ancestor_id: Optional[int] = None,
    status: Optional[str] = None,          # "met,partial" etc.
    sort_by: str = "code",
    sort_dir: str = "asc",
    page: int = 1,
    size: int = 50,
) -> RequirementsStatusPage:
    """
    Status per requirement using the SAME logic as coverage_rollup:
    - unknown: no mapping row at all
    - gap: mapped but no implementation (no CCL for this scope_type+scope_id)
    - partial: implementation exists (CCL) but no valid evidence now
    - met: valid evidence now on a CCL under this requirement
    """

    # Column resolution (robust to naming differences)
    CFM_REQ_ID = _required_col(
        ControlFrameworkMapping,
        "requirement_id", "framework_requirement_id", endswith="requirement_id",
    )
    CFM_CTRL_ID = _required_col(
        ControlFrameworkMapping,
        "control_id", endswith="control_id", contains=["control","id"],
    )

    CCL_ID       = _required_col(ControlContextLink, "id")
    CCL_CTRL_ID  = _required_col(ControlContextLink, "control_id", endswith="control_id")
    CCL_CTX_TYPE = _required_col(ControlContextLink, "context_type", "scope_type", endswith="context_type")
    CCL_CTX_ID   = _required_col(ControlContextLink, "context_id", "scope_id", endswith="context_id")


    CE_LINK_ID   = _required_col(ControlEvidence, "control_context_link_id", "context_link_id", "ccl_id", endswith="link_id")
    CE_STATUS    = _required_col(ControlEvidence, "status", "state")
    CE_VALID_FROM = _try_pick_col(ControlEvidence, "valid_from", "effective_from", "start_date", endswith="valid_from")
    CE_VALID_TO   = _try_pick_col(ControlEvidence, "valid_to", "effective_to", "end_date", endswith="valid_to")

    CCL_APPL = _try_pick_col(ControlContextLink, "applicability")
    appl_filters = []

    if CCL_APPL is not None:
        appl_filters.append(
            or_(ControlContextLink.__table__.c[CCL_APPL.key].is_(None),
            ControlContextLink.__table__.c[CCL_APPL.key] != "na"))

    now = _now_utc()

    meta_by_id = _load_req_meta(db, version_id)
    path_cache: Dict[int, Tuple[List[int], List[str]]] = {}

    # All requirement ids for the version
    all_req_ids = [r for (r,) in db.execute(
        select(FrameworkRequirement.id)
        .where(FrameworkRequirement.framework_version_id == version_id)
    ).all()]

    # Mapped requirement ids (has a CFM row)
    mapped_req_ids = {r for (r,) in db.execute(
        select(distinct(CFM_REQ_ID))
        .join(FrameworkRequirement, FrameworkRequirement.id == CFM_REQ_ID)
        .where(FrameworkRequirement.framework_version_id == version_id)
    ).all() if r is not None}

    # Implemented (has a CCL for this scope)
    impl_req_ids = {r for (r,) in db.execute(
        select(distinct(CFM_REQ_ID))
        .join(FrameworkRequirement, FrameworkRequirement.id == CFM_REQ_ID)
        .join(ControlContextLink, ControlContextLink.__table__.c[CCL_CTRL_ID.key] == CFM_CTRL_ID)
        .where(
            FrameworkRequirement.framework_version_id == version_id,
            ControlContextLink.__table__.c[CCL_CTX_TYPE.key] == scope_type,
            ControlContextLink.__table__.c[CCL_CTX_ID.key] == scope_id,
            *appl_filters
        )
    ).all() if r is not None}

    # Met (has valid evidence now on a CCL for this scope)
    ev_filters = [CE_STATUS == "valid"]
    if CE_VALID_FROM is not None:
        ev_filters.append(or_(CE_VALID_FROM.is_(None), CE_VALID_FROM <= now))
    if CE_VALID_TO is not None:
        ev_filters.append(or_(CE_VALID_TO.is_(None), CE_VALID_TO >= now))

    met_req_ids = {r for (r,) in db.execute(
        select(distinct(CFM_REQ_ID))
        .join(FrameworkRequirement, FrameworkRequirement.id == CFM_REQ_ID)
        .join(ControlContextLink, ControlContextLink.__table__.c[CCL_CTRL_ID.key] == CFM_CTRL_ID)
        .join(ControlEvidence, ControlEvidence.__table__.c[CE_LINK_ID.key] == ControlContextLink.__table__.c[CCL_ID.key])
        .where(
            FrameworkRequirement.framework_version_id == version_id,
            ControlContextLink.__table__.c[CCL_CTX_TYPE.key] == scope_type,
            ControlContextLink.__table__.c[CCL_CTX_ID.key] == scope_id,
            *ev_filters,
            *appl_filters,
            valid_evidence_filters()
        )
    ).all() if r is not None}

    def _status_for(req_id: int) -> str:
        if req_id not in mapped_req_ids:
            return "unknown"
        if req_id in met_req_ids:
            return "met"
        if req_id in impl_req_ids:
            return "partial"
        return "gap"

    # Build items
    items: List[RequirementStatusItem] = []
    for req_id in all_req_ids:
        m = meta_by_id.get(req_id, {})
        ids_path, codes_path = _compute_path(meta_by_id, req_id, path_cache)
        top_level_id = ids_path[0] if ids_path else None
        top_level_code = codes_path[0] if codes_path else None
        breadcrumb = " > ".join(codes_path) if codes_path else None

        s = _status_for(req_id)
        score = 1.0 if s == "met" else (0.5 if s == "partial" else 0.0)

        items.append(
            RequirementStatusItem(
                requirement_id=req_id,
                code=m.get("code") or str(req_id),
                title=m.get("title"),
                status=s,
                score=score,
                exception_applied=False,
                parent_id=m.get("parent_id"),
                top_level_id=top_level_id,
                top_level_code=top_level_code,
                breadcrumb=breadcrumb,
            )
        )

    # Filters
    if status:
        wanted = {s.strip().lower() for s in status.split(",") if s.strip()}
        items = [x for x in items if x.status in wanted]

    if q:
        qnorm = q.strip().lower()
        items = [x for x in items if qnorm in (x.code or "").lower()
                 or qnorm in (x.title or "").lower()
                 or qnorm in (x.breadcrumb or "").lower()]

    if ancestor_id:
        items = [x for x in items if x.top_level_id == ancestor_id
                 or x.parent_id == ancestor_id
                 or str(ancestor_id) in (x.breadcrumb or "")]

    # Sort
    reverse = (sort_dir.lower() == "desc")
    if sort_by == "title":
        items.sort(key=lambda x: (x.title or "").lower(), reverse=reverse)
    elif sort_by == "status":
        order = {"met": 0, "partial": 1, "gap": 2, "unknown": 3}
        items.sort(key=lambda x: order.get(x.status, 99), reverse=reverse)
    elif sort_by == "score":
        items.sort(key=lambda x: x.score, reverse=reverse)
    elif sort_by == "sort_index":
        items.sort(key=lambda x: meta_by_id.get(x.requirement_id, {}).get("sort_index", 0), reverse=reverse)
    else:
        items.sort(key=lambda x: (x.code or ""), reverse=reverse)

    # Pagination
    page = max(page, 1)
    size = max(min(size, 500), 1)
    total = len(items)
    start = (page - 1) * size
    end = start + size
    items_page = items[start:end]

    return RequirementsStatusPage(
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        page=page,
        size=size,
        total=total,
        items=items_page,
    )
