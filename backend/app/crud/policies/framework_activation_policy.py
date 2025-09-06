from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.policies.framework_activation_policy import FrameworkActivationPolicy
from app.schemas.policies.framework_activation_policy import FrameworkActivationPolicyCreate, FrameworkActivationPolicyUpdate

def create(db: Session, data: FrameworkActivationPolicyCreate) -> FrameworkActivationPolicy:
    row = FrameworkActivationPolicy(**data.model_dump()); db.add(row); db.commit(); db.refresh(row); return row
def update(db: Session, id: int, data: FrameworkActivationPolicyUpdate) -> Optional[FrameworkActivationPolicy]:
    row = db.query(FrameworkActivationPolicy).get(id);
    if not row: return None
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(row,k,v)
    db.commit(); db.refresh(row); return row
def delete(db: Session, id: int) -> bool:
    row = db.query(FrameworkActivationPolicy).get(id);
    if not row: return False
    db.delete(row); db.commit(); return True
def list_active(db: Session) -> List[FrameworkActivationPolicy]:
    now = datetime.utcnow()
    return db.query(FrameworkActivationPolicy).filter(
        FrameworkActivationPolicy.start_date <= now,
        (FrameworkActivationPolicy.end_date.is_(None)) | (FrameworkActivationPolicy.end_date >= now)
    ).order_by(FrameworkActivationPolicy.priority.desc()).all()
