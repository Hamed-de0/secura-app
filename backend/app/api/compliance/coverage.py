from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.constants.scopes import is_valid_scope, normalize_scope

from app.schemas.compliance.implementation_coverage import FrameworkImplementationCoverage
from app.services.compliance.coverage_effective import compute_version_effective_coverage

router = APIRouter(prefix="/coverage", tags=["Compliance - Coverage"])

@router.get("/framework_versions/{version_id}/effective", response_model=FrameworkImplementationCoverage)
def get_version_effective_coverage(
    version_id: int,
    scope_type: str = Query(..., description="asset|asset_type|asset_group|tag|bu|site|entity|service|org_group"),
    scope_id: int = Query(...),
    db: Session = Depends(get_db),
):
    if not is_valid_scope(scope_type):
        raise HTTPException(400, detail=f"Unsupported scope_type '{scope_type}'")
    try:
        return compute_version_effective_coverage(db, version_id, normalize_scope(scope_type), scope_id)
    except ImportError as e:
        raise HTTPException(500, detail=str(e))
    except Exception as e:
        raise HTTPException(404, detail=str(e))
