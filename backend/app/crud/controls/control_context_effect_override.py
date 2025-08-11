from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.controls.control_context_effect_override import ControlContextEffectOverride
from app.schemas.controls.control_context_effect_override import ControlContextEffectOverrideCreate, ControlContextEffectOverrideUpdate

def upsert(db: Session, data: ControlContextEffectOverrideCreate) -> ControlContextEffectOverride:
    row = db.query(ControlContextEffectOverride).filter_by(
        risk_scenario_context_id=data.risk_scenario_context_id,
        control_id=data.control_id,
        domain_id=data.domain_id
    ).first()
    if row is None:
        row = ControlContextEffectOverride(**data.dict())
        db.add(row)
    else:
        for k, v in data.dict().items():
            setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

def update(db: Session, id: int, data: ControlContextEffectOverrideUpdate) -> Optional[ControlContextEffectOverride]:
    row = db.query(ControlContextEffectOverride).get(id)
    if not row: return None
    for k, v in data.dict(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

def delete(db: Session, id: int) -> bool:
    row = db.query(ControlContextEffectOverride).get(id)
    if not row: return False
    db.delete(row); db.commit()
    return True

def list_by_context(db: Session, context_id: int) -> List[ControlContextEffectOverride]:
    return db.query(ControlContextEffectOverride).filter_by(risk_scenario_context_id=context_id).all()
