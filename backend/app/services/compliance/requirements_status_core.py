from __future__ import annotations
from typing import Iterable, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.services.compliance.requirements_status import list_requirements_status  # reuse your fixed logic

def query_requirements_status_items(
    db: Session,
    *,
    version_id: int,
    scope_type: str,
    scope_id: int,
    # requirement_ids: Optional[Iterable[int]] = None,
    status: Optional[str] = None,
    sort_by: str = "code",
    sort_dir: str = "asc",
    page: int = 1,
    size: int = 50,
) -> Dict[str, Any]:
    """
    Thin wrapper to call your existing list_requirements_status() and return dict with items.
    Keeps a single source of truth for status calculation.
    """
    # Your list_requirements_status returns a Page-like dict/obj:
    return list_requirements_status(  # type: ignore
        db=db,
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        status=status,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        size=size,
        # requirement_ids=list(requirement_ids) if requirement_ids else None,
    )
