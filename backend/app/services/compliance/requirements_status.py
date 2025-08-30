from typing import List, Optional, Dict, Tuple, Set
from sqlalchemy.orm import Session

from app.schemas.compliance.requirements_status import (
    RequirementsStatusPage,
    RequirementStatusItem,
)

# C-1 compute
from app.services.compliance.coverage_effective import compute_version_effective_coverage
from app.models.compliance.framework_requirement import FrameworkRequirement


def _load_req_meta(db: Session, version_id: int) -> Dict[int, Dict]:
    """
    Return {id: {code, title, parent_id, sort_index}} for the version.
    """
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
    meta = {}
    for r in rows:
        meta[r.id] = {
            "code": r.code,
            "title": r.title,
            "parent_id": r.parent_id,
            "sort_index": r.sort_index,
        }
    return meta


def _compute_path(
    meta_by_id: Dict[int, Dict],
    req_id: int,
    _cache: Dict[int, Tuple[List[int], List[str]]]  # id -> (ids_path, codes_path)
) -> Tuple[List[int], List[str]]:
    """
    Compute ancestor path from top-level to req_id using parent links.
    Cache results. Returns (ids_path, codes_path).
    """
    if req_id in _cache:
        return _cache[req_id]

    visited: Set[int] = set()
    ids_rev: List[int] = []
    codes_rev: List[str] = []
    cur = req_id
    while cur and cur in meta_by_id and cur not in visited:
        visited.add(cur)
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
    # removed domain; use ancestor_id to filter a subtree
    ancestor_id: Optional[int] = None,
    status: Optional[str] = None,            # "met,partial" etc.
    sort_by: str = "code",                   # "code" | "title" | "status" | "score" | "sort_index"
    sort_dir: str = "asc",                   # "asc" | "desc"
    page: int = 1,
    size: int = 50,
) -> RequirementsStatusPage:
    """
    Paginated/filterable list of requirement statuses (hierarchy-aware).
    """
    fcov = compute_version_effective_coverage(
        db=db, version_id=version_id, scope_type=scope_type, scope_id=scope_id
    )

    meta_by_id = _load_req_meta(db, version_id)
    path_cache: Dict[int, Tuple[List[int], List[str]]] = {}

    # Build items with hierarchy decorations
    items: List[RequirementStatusItem] = []
    for r in fcov.requirements:
        m = meta_by_id.get(r.requirement_id, {})
        ids_path, codes_path = _compute_path(meta_by_id, r.requirement_id, path_cache)
        top_level_id = ids_path[0] if ids_path else None
        top_level_code = codes_path[0] if codes_path else None
        breadcrumb = " > ".join(codes_path) if codes_path else None

        items.append(
            RequirementStatusItem(
                requirement_id=r.requirement_id,
                code=(r.code or m.get("code") or str(r.requirement_id)),
                title=(r.title or m.get("title")),
                status=r.status,
                score=r.score or 0.0,
                exception_applied=getattr(r, "exception_applied", False),
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
        items = [
            x for x in items
            if qnorm in (x.code or "").lower() or qnorm in (x.title or "").lower() or qnorm in (x.breadcrumb or "").lower()
        ]

    # Subtree filter: include items whose path contains ancestor_id
    if ancestor_id:
        items = [x for x in items if x.top_level_id == ancestor_id or x.parent_id == ancestor_id or str(ancestor_id) in (x.breadcrumb or "")]

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
        # Need sort_index from meta
        items.sort(key=lambda x: meta_by_id.get(x.requirement_id, {}).get("sort_index", 0), reverse=reverse)
    else:
        # default by code (breadcrumb-aware)
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
