from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.controls.control_context_link import ControlContextLink
from app.schemas.controls.control_context_link import ControlContextLinkCreate, ControlContextLinkUpdate

def upsert(db: Session, data: ControlContextLinkCreate) -> ControlContextLink:
    row = db.query(ControlContextLink).filter_by(
        risk_scenario_context_id=data.risk_scenario_context_id,
        control_id=data.control_id
    ).first()
    if row is None:
        row = ControlContextLink(**data.dict())
        db.add(row)
    else:
        for k, v in data.dict().items():
            setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

def update(db: Session, id: int, data: ControlContextLinkUpdate) -> Optional[ControlContextLink]:
    row = db.query(ControlContextLink).get(id)
    if not row: return None
    for k, v in data.dict(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

def delete(db: Session, id: int) -> bool:
    row = db.query(ControlContextLink).get(id)
    if not row: return False
    db.delete(row); db.commit()
    return True

def list_by_context(db: Session, context_id: int) -> List[ControlContextLink]:
    return db.query(ControlContextLink).filter_by(risk_scenario_context_id=context_id).all()
