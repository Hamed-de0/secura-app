from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.compliance.coverage import FrameworkCoverageSummary
from app.services.compliance.coverage import compute_version_mapping_coverage

router = APIRouter(prefix="/coverage", tags=["Compliance - Coverage"])

@router.get("/framework_versions/{version_id}", response_model=FrameworkCoverageSummary)
def get_version_coverage(version_id: int, db: Session = Depends(get_db)):
    try:
        return compute_version_mapping_coverage(db, version_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
