from sqlalchemy.orm import Session
from app.models.risks.threat import Threat
from app.schemas.risks.threat import ThreatCreate, ThreatUpdate


def create_threat(db: Session, threat: ThreatCreate) -> Threat:
    db_threat = Threat(**threat.model_dump())
    db.add(db_threat)
    db.commit()
    db.refresh(db_threat)
    return db_threat


def get_threat(db: Session, threat_id: int) -> Threat:
    return db.query(Threat).filter(Threat.id == threat_id).first()


def get_threats(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Threat).offset(skip).limit(limit).all()


def update_threat(db: Session, threat_id: int, threat_update: ThreatUpdate):
    db_threat = db.query(Threat).filter(Threat.id == threat_id).first()
    if db_threat is None:
        return None
    for key, value in threat_update.model_dump(exclude_unset=True).items():
        setattr(db_threat, key, value)
    db.commit()
    db.refresh(db_threat)
    return db_threat


def delete_threat(db: Session, threat_id: int):
    db_threat = db.query(Threat).filter(Threat.id == threat_id).first()
    if db_threat:
        db.delete(db_threat)
        db.commit()
        return True
    return False
