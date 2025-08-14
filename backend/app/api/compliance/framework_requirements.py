from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.compliance.framework_requirement import FrameworkRequirementCreate, FrameworkRequirementUpdate, FrameworkRequirementOut
from app.crud.compliance import framework_requirement as crud

router = APIRouter(prefix="/framework_requirements", tags=["Compliance - Framework Requirements"])

@router.get("/versions/{version_id}/requirements", response_model=List[FrameworkRequirementOut])
def list_by_version(version_id: int, db: Session = Depends(get_db)):
    return crud.list_by_version(db, version_id)

@router.post("/versions/{version_id}/requirements", response_model=FrameworkRequirementOut)
def create_for_version(version_id: int, payload: FrameworkRequirementCreate, db: Session = Depends(get_db)):
    data = payload.model_copy(update={"framework_version_id": version_id})
    return crud.create(db, data)

@router.put("/{id}", response_model=FrameworkRequirementOut)
def update(id: int, payload: FrameworkRequirementUpdate, db: Session = Depends(get_db)):
    row = crud.update(db, id, payload)
    if not row: raise HTTPException(404, "Not found")
    return row

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    ok = crud.delete(db, id)
    if not ok: raise HTTPException(404, "Not found")
    return {"deleted": ok}
