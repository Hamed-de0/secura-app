from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.compliance.evidence_policy import EvidencePolicy
from app.schemas.compliance.evidence_policy import EvidencePolicyCreate, EvidencePolicyUpdate

def create(db: Session, payload: EvidencePolicyCreate) -> EvidencePolicy:
    # basic guard: exactly one target
    if bool(payload.control_id) == bool(payload.framework_requirement_id):
        raise ValueError("Provide exactly one of control_id or framework_requirement_id")
    obj = EvidencePolicy(**payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def update(db: Session, policy_id: int, payload: EvidencePolicyUpdate) -> Optional[EvidencePolicy]:
    obj = db.query(EvidencePolicy).get(policy_id)
    if not obj: return None
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, policy_id: int) -> bool:
    obj = db.query(EvidencePolicy).get(policy_id)
    if not obj: return False
    db.delete(obj); db.commit()
    return True

def get_by_control(db: Session, control_id: int) -> Optional[EvidencePolicy]:
    return db.query(EvidencePolicy).filter(EvidencePolicy.control_id == control_id).first()

def get_by_requirement(db: Session, framework_requirement_id: int) -> Optional[EvidencePolicy]:
    return db.query(EvidencePolicy).filter(EvidencePolicy.framework_requirement_id == framework_requirement_id).first()
