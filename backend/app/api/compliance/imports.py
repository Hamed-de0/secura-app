from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.compliance.imports import ImportResult
from app.services.compliance.requirements_importer import import_requirements_csv_idbased

router = APIRouter(prefix="/imports", tags=["Compliance - Imports"])

@router.post("/framework_versions/{version_id}/requirements/csv-id", response_model=ImportResult)
async def import_requirements_csv_id_api(version_id: int, file: UploadFile = File(...), dry_run: bool = Query(False), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")
    text = (await file.read()).decode("utf-8", errors="ignore")
    try:
        return import_requirements_csv_idbased(db, version_id, text, dry_run=dry_run)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
