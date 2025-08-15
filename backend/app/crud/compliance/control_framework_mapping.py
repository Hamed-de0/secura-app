from fastapi import HTTPException
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


def _check_uniqueness(db: Session, obj: ControlFrameworkMapping):
    """Protect against duplicates at both article-level and atom-level.
    DB has constraints, but we raise clean HTTP errors before hitting them.
    """
    if obj.obligation_atom_id is None:
        exists = (
            db.query(ControlFrameworkMapping)
            .filter(
                ControlFrameworkMapping.framework_requirement_id == obj.framework_requirement_id,
                ControlFrameworkMapping.control_id == obj.control_id,
                ControlFrameworkMapping.obligation_atom_id.is_(None),
            )
            .first()
        )
        if exists and exists.id != obj.id:
            raise HTTPException(409, detail="Mapping already exists for (requirement, control) at article-level")
    else:
        exists = (
            db.query(ControlFrameworkMapping)
            .filter(
                ControlFrameworkMapping.obligation_atom_id == obj.obligation_atom_id,
                ControlFrameworkMapping.control_id == obj.control_id,
            )
            .first()
        )
        if exists and exists.id != obj.id:
            raise HTTPException(409, detail="Mapping already exists for (atom, control)")


def create_mapping(db: Session, data: ControlFrameworkMappingCreate) -> ControlFrameworkMapping:
    obj = ControlFrameworkMapping(**data.dict())
    _check_uniqueness(db, obj)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_mapping(db: Session, mapping_id: int, data: ControlFrameworkMappingUpdate) -> ControlFrameworkMapping:
    obj = db.query(ControlFrameworkMapping).get(mapping_id)
    if not obj:
        raise HTTPException(404, detail="Mapping not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    _check_uniqueness(db, obj)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj




