from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.compliance.exceptions import (
    ComplianceExceptionCreate, ComplianceExceptionUpdate, ComplianceExceptionOut,
    ComplianceExceptionCommentCreate, ComplianceExceptionCommentOut
)
from app.crud.compliance import exceptions as crud

router = APIRouter(prefix="/exceptions", tags=["Compliance - Exceptions"])

@router.post("", response_model=ComplianceExceptionOut)
def create_exception(payload: ComplianceExceptionCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.get("", response_model=List[ComplianceExceptionOut])
def list_exception(
    context_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    control_id: Optional[int] = Query(None),
    framework_requirement_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return crud.list_exceptions(db, context_id, status, control_id, framework_requirement_id)

@router.get("/{exc_id}", response_model=ComplianceExceptionOut)
def get_exception(exc_id: int, db: Session = Depends(get_db)):
    obj = crud.get(db, exc_id)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.patch("/{exc_id}", response_model=ComplianceExceptionOut)
def update_exception(exc_id: int, payload: ComplianceExceptionUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, exc_id, payload)
    if not obj: raise HTTPException(404, "Not found")
    return obj

# --- workflow ---

@router.post("/{exc_id}/submit", response_model=ComplianceExceptionOut)
def submit_exception(exc_id: int, db: Session = Depends(get_db)):
    obj = crud.submit(db, exc_id)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("/{exc_id}/approve", response_model=ComplianceExceptionOut)
def approve_exception(exc_id: int, db: Session = Depends(get_db)):
    obj = crud.approve(db, exc_id)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("/{exc_id}/reject", response_model=ComplianceExceptionOut)
def reject_exception(exc_id: int, db: Session = Depends(get_db)):
    obj = crud.reject(db, exc_id)
    if not obj: raise HTTPException(404, "Not found")
    return obj

@router.post("/{exc_id}/withdraw", response_model=ComplianceExceptionOut)
def withdraw_exception(exc_id: int, db: Session = Depends(get_db)):
    obj = crud.withdraw(db, exc_id)
    if not obj: raise HTTPException(404, "Not found")
    return obj

# --- comments ---

@router.post("/{exc_id}/comments", response_model=ComplianceExceptionCommentOut)
def add_comment(exc_id: int, payload: ComplianceExceptionCommentCreate, db: Session = Depends(get_db)):
    c = crud.add_comment(db, exc_id, payload)
    if not c: raise HTTPException(404, "Not found")
    return c

@router.get("/{exc_id}/comments", response_model=List[ComplianceExceptionCommentOut])
def list_comment(exc_id: int, db: Session = Depends(get_db)):
    return crud.list_comments(db, exc_id)
