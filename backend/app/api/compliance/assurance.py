from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.compliance.assurance import compute_assurance_rollup

router = APIRouter(prefix="/assurance", tags=["Compliance - Assurance Coverage"])

@router.get("/framework_versions/{version_id}")
def get_assurance(
    version_id: int,
    context_id: int = Query(..., description="risk_scenario_context_id"),
    db: Session = Depends(get_db),
):
    try:
        return compute_assurance_rollup(db, version_id, context_id)
    except Exception as e:
        raise HTTPException(400, str(e))
