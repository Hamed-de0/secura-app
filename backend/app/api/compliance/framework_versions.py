from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.compliance.framework_version import FrameworkVersionCreate, FrameworkVersionUpdate, FrameworkVersionOut
from app.crud.compliance import framework_version as crud

router = APIRouter(prefix="/framework_versions", tags=["Compliance - Framework Versions"])

@router.post("", response_model=FrameworkVersionOut)
def create_version(payload: FrameworkVersionCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

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
