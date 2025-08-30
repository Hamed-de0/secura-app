from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps.scope import resolve_scope             # <-- add
from app.database import get_db
from app.schemas.compliance.requirements_status import RequirementsStatusPage
from app.services.compliance.requirements_status import list_requirements_status

router = APIRouter(prefix="/compliance/requirements", tags=["Compliance Requirements"])

@router.get("/status", response_model=RequirementsStatusPage)
def get_requirements_status(
    version_id: int = Query(...),
    # scope_type: str = Query(..., description="org | asset_group | asset_type | tag | asset"),
    # scope_id: int = Query(...),
    scope: tuple[str, int] = Depends(resolve_scope),

    # Filters
    q: str | None = Query(None, description="Search code/title/breadcrumb"),
    ancestor_id: int | None = Query(None, description="Filter by subtree (top-level or any ancestor id)"),
    status: str | None = Query(None, description="Comma-separated: met,partial,gap,unknown"),

    # Sort / paging
    sort_by: str = Query("code", description="code|title|status|score|sort_index"),
    sort_dir: str = Query("asc", description="asc|desc"),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=500),

    db: Session = Depends(get_db),
):
    """
    Grid-ready status list, hierarchy-aware (parent/child). Use `ancestor_id` to filter a subtree.
    """
    scope_type, scope_id = scope
    return list_requirements_status(
        db=db,
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        q=q,
        ancestor_id=ancestor_id,
        status=status,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        size=size,
    )
