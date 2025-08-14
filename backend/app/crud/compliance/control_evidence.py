from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.compliance.control_evidence import ControlEvidence
from app.schemas.compliance.evidence import ControlEvidenceCreate, ControlEvidenceUpdate

def create(db: Session, payload: ControlEvidenceCreate) -> ControlEvidence:
    obj = ControlEvidence(**payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def get(db: Session, evidence_id: int) -> Optional[ControlEvidence]:
    return db.query(ControlEvidence).get(evidence_id)

def list_by_link(db: Session, control_context_link_id: int) -> List[ControlEvidence]:
    return (
        db.query(ControlEvidence)
        .filter(ControlEvidence.control_context_link_id == control_context_link_id)
        .order_by(ControlEvidence.collected_at.desc(), ControlEvidence.id.desc())
        .all()
    )

def update(db: Session, evidence_id: int, payload: ControlEvidenceUpdate) -> Optional[ControlEvidence]:
    obj = db.query(ControlEvidence).get(evidence_id)
    if not obj: return None
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, evidence_id: int) -> bool:
    obj = db.query(ControlEvidence).get(evidence_id)
    if not obj: return False
    db.delete(obj); db.commit()
    return True
