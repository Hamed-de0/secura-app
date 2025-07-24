from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.risks.threat_links import *
from app.crud.risks import threat_links as crud
from app.database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(prefix="/threat-vulnerability-link", tags=["Threat-Vulnerability Link"])

@router.post("/", response_model=VulnerabilityThreatLinkRead)
def create_link(data: VulnerabilityThreatLinkCreate, db: Session = Depends(get_db)):
    return crud.create_link(db, data)

@router.get("/", response_model=list[VulnerabilityThreatLinkRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_links(db, skip, limit)

@router.delete("/{link_id}", response_model=VulnerabilityThreatLinkRead)
def delete_link(link_id: int, db: Session = Depends(get_db)):
    link = crud.delete_link(db, link_id)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    return link

@router.get("/by-threat/{threat_id}", response_model=list[VulnerabilityThreatLinkRead])
def get_by_threat(threat_id: int, db: Session = Depends(get_db)):
    return crud.get_links_by_threat(db, threat_id)

@router.get("/by-vulnerability/{vuln_id}", response_model=list[VulnerabilityThreatLinkRead])
def get_by_vulnerability(vuln_id: int, db: Session = Depends(get_db)):
    return crud.get_links_by_vulnerability(db, vuln_id)
