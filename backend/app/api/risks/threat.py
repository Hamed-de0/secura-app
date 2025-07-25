from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.risks.threat import ThreatCreate, ThreatRead, ThreatUpdate
from app.crud.risks import threat as crud


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
router = APIRouter(prefix="/threats", tags=["Threats"])


@router.post("/", response_model=ThreatRead)
def create(threat: ThreatCreate, db: Session = Depends(get_db)):
    return crud.create_threat(db, threat)


@router.get("/", response_model=list[ThreatRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_threats(db, skip, limit)


@router.get("/{threat_id}", response_model=ThreatRead)
def read_one(threat_id: int, db: Session = Depends(get_db)):
    db_threat = crud.get_threat(db, threat_id)
    if not db_threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    return db_threat


@router.put("/{threat_id}", response_model=ThreatRead)
def update(threat_id: int, threat: ThreatUpdate, db: Session = Depends(get_db)):
    updated = crud.update_threat(db, threat_id, threat)
    if not updated:
        raise HTTPException(status_code=404, detail="Threat not found")
    return updated


@router.delete("/{threat_id}")
def delete(threat_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_threat(db, threat_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Threat not found")
    return {"ok": True}
