from sqlalchemy.orm import Session
from app.models.controls.control_threat_link import ControlThreatLink
from app.schemas.controls.control_threat_link import ControlThreatLinkCreate

def create_control_threat_link(db: Session, link: ControlThreatLinkCreate):
    db_link = ControlThreatLink(**link.model_dump())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

def delete_control_threat_link(db: Session, control_id: int, threat_id: int):
    db_link = db.query(ControlThreatLink).filter_by(
        control_id=control_id, threat_id=threat_id
    ).first()
    if db_link:
        db.delete(db_link)
        db.commit()
        return True
    return False
