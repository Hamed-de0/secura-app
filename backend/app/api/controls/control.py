from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.controls.control import ControlCreate, ControlRead, ControlUpdate
from app.crud.controls import control as crud_control
from app.database import SessionLocal


router = APIRouter(prefix="/controls", tags=["Controls"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ControlRead)
def create_control(control: ControlCreate, db: Session = Depends(get_db)):
    return crud_control.create_control(db, control)


@router.get("/{control_id}", response_model=ControlRead)
def get_control(control_id: int, db: Session = Depends(get_db)):
    db_control = crud_control.get_control(db, control_id)
    if not db_control:
        raise HTTPException(status_code=404, detail="Control not found")
    return db_control


@router.get("/", response_model=list[ControlRead])
def list_controls(db: Session = Depends(get_db)):
    return crud_control.get_controls(db)


@router.put("/{control_id}", response_model=ControlRead)
def update_control(control_id: int, control: ControlUpdate, db: Session = Depends(get_db)):
    updated = crud_control.update_control(db, control_id, control)
    if not updated:
        raise HTTPException(status_code=404, detail="Control not found")
    return updated


@router.delete("/{control_id}")
def delete_control(control_id: int, db: Session = Depends(get_db)):
    success = crud_control.delete_control(db, control_id)
    if not success:
        raise HTTPException(status_code=404, detail="Control not found")
    return {"ok": True}
