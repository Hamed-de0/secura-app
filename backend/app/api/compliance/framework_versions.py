from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.compliance.framework_version import FrameworksWithVersions, FrameworkVersionCreate, FrameworkVersionUpdate, FrameworkVersionOut
from app.crud.compliance import framework_version as crud

router = APIRouter(prefix="/framework_versions", tags=["Compliance - Framework Versions"])

@router.post("", response_model=FrameworkVersionOut)
def create_version(payload: FrameworkVersionCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.get("/", response_model=List[FrameworksWithVersions])
def list_frameworks_versions(offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("framework_name"),
    sort_dir: str = Query("asc"),
    search: str | None = Query(None),
    db: Session = Depends(get_db),):
    return crud.list_frameworks_with_versions(
        db, offset=offset, limit=limit, sort_by=sort_by, sort_dir=sort_dir, search=search
    )

@router.get("/frameworks/{framework_id}", response_model=List[FrameworkVersionOut])
def list_versions(framework_id: int, db: Session = Depends(get_db)):
    return crud.list_by_framework(db, framework_id)

@router.put("/{id}", response_model=FrameworkVersionOut)
def update_version(id: int, payload: FrameworkVersionUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, id, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.delete("/{id}")
def delete_version(id: int, db: Session = Depends(get_db)):
    ok = crud.delete(db, id)
    if not ok: raise HTTPException(404, "Not found")
    return {"deleted": ok}
