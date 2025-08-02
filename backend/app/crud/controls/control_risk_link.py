from sqlalchemy.orm import Session
from app.models.controls.control_risk_link import ControlRiskLink
from app.schemas.controls.control_risk_link import ControlRiskLinkCreate, ControlRiskLinkUpdate
from typing import List, Optional

def create_control_risk_link(db: Session, data: ControlRiskLinkCreate) -> ControlRiskLink:
    link = ControlRiskLink(**data.model_dump())
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def get_control_risk_links(db: Session) -> List[ControlRiskLink]:
    return db.query(ControlRiskLink).all()


def get_links_by_risk_scenario(db: Session, risk_scenario_id: int) -> List[ControlRiskLink]:
    return db.query(ControlRiskLink).filter_by(risk_scenario_id=risk_scenario_id).all()


def get_links_by_risk_control(db: Session, control_id: int) -> List[ControlRiskLink]:
    return db.query(ControlRiskLink).filter_by(control_id=control_id).all()


def update_control_risk_link(db: Session, link_id: int, data: ControlRiskLinkUpdate) -> Optional[ControlRiskLink]:
    link = db.query(ControlRiskLink).filter_by(id=link_id).first()
    if not link:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(link, field, value)
    db.commit()
    db.refresh(link)
    return link


def upsert_control_risk_link(db: Session, data: ControlRiskLinkCreate) -> Optional[ControlRiskLink]:
    existing = db.query(ControlRiskLink).filter_by(
        risk_scenario_id=data.risk_scenario_id,
        control_id=data.control_id
    ).first()

    if existing:
        existing.status = data.status
        existing.justification = data.justification
        existing.residual_score = data.residual_score
        existing.effect_type = data.effect_type

        db.commit()
        db.refresh(existing)
        return existing

    new_risk_control = ControlRiskLink(**data.dict())
    db.add(new_risk_control)
    db.commit()
    db.refresh(new_risk_control)
    return new_risk_control


def delete_control_risk_link(db: Session, link_id: int) -> bool:
    link = db.query(ControlRiskLink).filter_by(id=link_id).first()
    if not link:
        return False
    db.delete(link)
    db.commit()
    return True
