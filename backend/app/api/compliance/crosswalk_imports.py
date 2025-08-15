from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.compliance.crosswalk_importer import import_crosswalks_csv

router = APIRouter(prefix="/imports", tags=["Compliance - Crosswalk Imports"])

@router.post("/framework_versions/{version_id}/crosswalks/csv")
async def import_crosswalks_csv_api(
    version_id: int,
    file: UploadFile = File(...),
    dry_run: bool = Query(False),
    upsert: bool = Query(True),
    default_weight: int = Query(100),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")
    try:
        text = (await file.read()).decode("utf-8", errors="ignore")
        rep = import_crosswalks_csv(
            db,
            framework_version_id=version_id,
            csv_text=text,
            dry_run=dry_run,
            upsert=upsert,
            default_weight=default_weight,
        )
        return rep.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
