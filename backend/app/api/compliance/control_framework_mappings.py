from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.compliance.control_framework_mapping import (
    ControlFrameworkMappingCreate,
    ControlFrameworkMappingUpdate,
    ControlFrameworkMappingOut,
)
from app.schemas.compliance.framework_requirement import FrameworkRequirementOut
from app.crud.compliance import control_framework_mapping as crud

router = APIRouter(prefix="/crosswalks", tags=["Compliance - Crosswalks"])

@router.post("", response_model=ControlFrameworkMappingOut)
def create(payload: ControlFrameworkMappingCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.put("/{id}", response_model=ControlFrameworkMappingOut)
def update(id: int, payload: ControlFrameworkMappingUpdate, db: Session = Depends(get_db)):
    row = crud.update(db, id, payload)
    if not row:
        raise HTTPException(404, "Not found")
    return row

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    ok = crud.delete(db, id)
    if not ok:
        raise HTTPException(404, "Not found")
    return {"deleted": ok}

@router.get("/requirements/{framework_requirement_id}", response_model=List[ControlFrameworkMappingOut])
def list_by_requirement(framework_requirement_id: int, db: Session = Depends(get_db)):
    return crud.list_by_requirement(db, framework_requirement_id)

@router.get("/controls/{control_id}", response_model=List[FrameworkRequirementOut])
def list_requirements_for_control(control_id: int, db: Session = Depends(get_db)):
    return crud.list_requirements_by_control(db, control_id)
