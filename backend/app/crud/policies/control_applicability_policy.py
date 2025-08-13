from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.policies.control_applicability_policy import ControlApplicabilityPolicy
from app.schemas.policies.control_applicability_policy import (
    ControlApplicabilityPolicyCreate, ControlApplicabilityPolicyUpdate
)

def create(db: Session, data: ControlApplicabilityPolicyCreate) -> ControlApplicabilityPolicy:
    row = ControlApplicabilityPolicy(**data.model_dump())
    db.add(row); db.commit(); db.refresh(row); return row

def update(db: Session, id: int, data: ControlApplicabilityPolicyUpdate) -> Optional[ControlApplicabilityPolicy]:
    row = db.query(ControlApplicabilityPolicy).get(id)
    if not row: return None
    for k, v in data.model_dump(exclude_unset=True).items(): setattr(row, k, v)
    db.commit(); db.refresh(row); return row

def delete(db: Session, id: int) -> bool:
    row = db.query(ControlApplicabilityPolicy).get(id)
    if not row: return False
    db.delete(row); db.commit(); return True

def list(db: Session) -> List[ControlApplicabilityPolicy]:
    return db.query(ControlApplicabilityPolicy).order_by(ControlApplicabilityPolicy.priority.desc()).all()

def list_effective(db: Session) -> List[ControlApplicabilityPolicy]:
    now = datetime.utcnow()
    q = db.query(ControlApplicabilityPolicy).filter(
        ControlApplicabilityPolicy.effective_from <= now,
        (ControlApplicabilityPolicy.effective_to.is_(None)) | (ControlApplicabilityPolicy.effective_to >= now)
    )
    return q.all()
