from sqlalchemy.orm import Session
from app.models.mapping import VulnerabilityThreatLink
from app.schemas.threat_links import VulnerabilityThreatLinkCreate

def create_link(db: Session, data: VulnerabilityThreatLinkCreate):
    link = VulnerabilityThreatLink(**data.dict())
    db.add(link)
    db.commit()
    db.refresh(link)
    return link

def delete_link(db: Session, link_id: int):
    link = db.query(VulnerabilityThreatLink).filter(VulnerabilityThreatLink.id == link_id).first()
    if not link:
        return None
    db.delete(link)
    db.commit()
    return link

def get_links(db: Session, skip=0, limit=100):
    return db.query(VulnerabilityThreatLink).offset(skip).limit(limit).all()

def get_links_by_threat(db: Session, threat_id: int):
    return db.query(VulnerabilityThreatLink).filter(VulnerabilityThreatLink.threat_id == threat_id).all()

def get_links_by_vulnerability(db: Session, vulnerability_id: int):
    return db.query(VulnerabilityThreatLink).filter(VulnerabilityThreatLink.vulnerability_id == vulnerability_id).all()
