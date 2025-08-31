from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.constants.scopes import is_valid_scope, normalize_scope
from app.api.deps.scope import resolve_scope

from app.schemas.compliance.implementation_coverage import FrameworkImplementationCoverage
from app.schemas.compliance.coverage import CoverageRollupResponse, CoverageRollupItem
from app.services.compliance.coverage_rollup import coverage_rollup_by_scope_type

from app.services.compliance.coverage_effective import compute_version_effective_coverage
from typing import List
from datetime import datetime
router = APIRouter(prefix="/coverage", tags=["Compliance - Coverage"])

@router.get("/framework_versions/{version_id}/effective", response_model=FrameworkImplementationCoverage)
def get_version_effective_coverage(
    version_id: int,
    scope: tuple[str,int]=Depends(resolve_scope),
    # scope_type: str = Query(..., description="asset|asset_type|asset_group|tag|bu|site|entity|service|org_group"),
    # scope_id: int = Query(...),
    db: Session = Depends(get_db),
):
    scope_type, scope_id = scope
    if not is_valid_scope(scope_type):
        raise HTTPException(400, detail=f"Unsupported scope_type '{scope_type}'")
    try:
        return compute_version_effective_coverage(db, version_id, normalize_scope(scope_type), scope_id)
    except ImportError as e:
        raise HTTPException(500, detail=str(e))
    except Exception as e:
        raise HTTPException(404, detail=str(e))



@router.get("/rollup")
def get_coverage_rollup(
    version_id: int = Query(..., gt=0),
    scope_types: list[str] = Query(default=["org", "entity", "bu", "service", "site", "asset_group", "asset_type", "tag", "asset"]),
    db: Session = Depends(get_db),
):
    try:
        return coverage_rollup_by_scope_type(db, version_id, scope_types)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
