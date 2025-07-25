from sqlalchemy.orm import Session
from app.models.controls.control import Control
from app.schemas.controls.control import ControlCreate, ControlUpdate

def create_control(db: Session, control: ControlCreate) -> Control:
    db_control = Control(**control.model_dump())
    db.add(db_control)
    db.commit()
    db.refresh(db_control)
    return db_control

def get_control(db: Session, control_id: int) -> Control | None:
    return db.query(Control).filter(Control.id == control_id).first()

def get_controls(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Control).offset(skip).limit(limit).all()

def update_control(db: Session, control_id: int, control: ControlUpdate) -> Control | None:
    db_control = get_control(db, control_id)
    if not db_control:
        return None
    for field, value in control.model_dump(exclude_unset=True).items():
        setattr(db_control, field, value)
    db.commit()
    db.refresh(db_control)
    return db_control

def delete_control(db: Session, control_id: int) -> bool:
    db_control = get_control(db, control_id)
    if not db_control:
        return False
    db.delete(db_control)
    db.commit()
    return True
