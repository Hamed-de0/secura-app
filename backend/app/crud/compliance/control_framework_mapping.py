from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.schemas.compliance.control_framework_mapping import ControlFrameworkMappingCreate, ControlFrameworkMappingUpdate
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.controls.control import Control

def create(db: Session, data: ControlFrameworkMappingCreate) -> ControlFrameworkMapping:
    row = ControlFrameworkMapping(**data.model_dump()); db.add(row); db.commit(); db.refresh(row); return row
def update(db: Session, id: int, data: ControlFrameworkMappingUpdate) -> Optional[ControlFrameworkMapping]:
    row = db.query(ControlFrameworkMapping).get(id)
    if not row: return None
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(row,k,v)
    db.commit(); db.refresh(row); return row
def delete(db: Session, id: int) -> bool:
    row = db.query(ControlFrameworkMapping).get(id)
    if not row: return False
    db.delete(row); db.commit(); return True
def list_by_requirement(db: Session, framework_requirement_id: int) -> List[ControlFrameworkMapping]:
    return db.query(ControlFrameworkMapping).filter_by(framework_requirement_id=framework_requirement_id).all()

def list_by_control(db: Session, control_id: int) -> List[ControlFrameworkMapping]:
    return db.query(ControlFrameworkMapping).filter_by(control_id=control_id).all()

def list_requirements_by_control(db: Session, control_id: int) -> List[FrameworkRequirement]:
    return (
        db.query(FrameworkRequirement)
        .join(ControlFrameworkMapping, ControlFrameworkMapping.framework_requirement_id == FrameworkRequirement.id)
        .filter(ControlFrameworkMapping.control_id == control_id)
        .order_by(FrameworkRequirement.code.asc())
        .all()
    )

def list_controls_by_requirement(db: Session, framework_requirement_id: int) -> List[Control]:
    return (
        db.query(Control)
        .join(ControlFrameworkMapping, ControlFrameworkMapping.control_id == Control.id)
        .filter(ControlFrameworkMapping.framework_requirement_id == framework_requirement_id)
        .order_by(Control.reference_code.asc())
        .all()
    )

