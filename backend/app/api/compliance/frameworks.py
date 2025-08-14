from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.compliance.framework import FrameworkCreate, FrameworkUpdate, FrameworkOut
from app.crud.compliance import framework as crud

router = APIRouter(prefix="/frameworks", tags=["Compliance - Frameworks"])

@router.get("", response_model=List[FrameworkOut])
def list_all(db: Session = Depends(get_db)): return crud.list(db)

@router.post("", response_model=FrameworkOut)
def create(payload: FrameworkCreate, db: Session = Depends(get_db)): return crud.create(db, payload)

@router.put("/{id}", response_model=FrameworkOut)
def update(id: int, payload: FrameworkUpdate, db: Session = Depends(get_db)):
    row = crud.update(db, id, payload);
    if not row: raise HTTPException(404, "Not found");
    return row

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    ok = crud.delete(db, id);
    if not ok: raise HTTPException(404, "Not found");
    return {"deleted": ok}
