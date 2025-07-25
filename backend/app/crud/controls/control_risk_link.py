from sqlalchemy.orm import Session
from app.models.controls.control_risk_link import ControlRiskLink
from app.schemas.controls.control_risk_link import ControlRiskLinkCreate

def create_control_risk_link(db: Session, link: ControlRiskLinkCreate):
    db_link = ControlRiskLink(**link.model_dump())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

def delete_control_risk_link(db: Session, control_id: int, risk_scenario_id: int):
    db_link = db.query(ControlRiskLink).filter_by(
        control_id=control_id, risk_scenario_id=risk_scenario_id
    ).first()
    if db_link:
        db.delete(db_link)
        db.commit()
        return True
    return False
