from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.schemas.compliance.framework_requirement import FrameworkRequirementCreate, FrameworkRequirementUpdate

def create(db: Session, data: FrameworkRequirementCreate) -> FrameworkRequirement:
    row = FrameworkRequirement(**data.model_dump()); db.add(row); db.commit(); db.refresh(row); return row
def update(db: Session, id: int, data: FrameworkRequirementUpdate) -> Optional[FrameworkRequirement]:
    row = db.query(FrameworkRequirement).get(id);
    if not row: return None
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(row,k,v)
    db.commit(); db.refresh(row); return row
def delete(db: Session, id: int) -> bool:
    row = db.query(FrameworkRequirement).get(id);
    if not row: return False
    db.delete(row); db.commit(); return True
def list_by_framework(db: Session, framework_id: int) -> List[FrameworkRequirement]:
    return db.query(FrameworkRequirement).filter_by(framework_id=framework_id).order_by(FrameworkRequirement.code.asc()).all()
