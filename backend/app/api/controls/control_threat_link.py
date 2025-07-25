from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.controls.control_threat_link import ControlThreatLinkCreate
from app.crud.controls import control_threat_link
from app.database import get_db

router = APIRouter(prefix="/control-threat-links", tags=["Control-Threat Links"])


@router.post("/")
def create_link(link: ControlThreatLinkCreate, db: Session = Depends(get_db)):
    return control_threat_link.create_control_threat_link(db, link)


@router.delete("/")
def delete_link(control_id: int, threat_id: int, db: Session = Depends(get_db)):
    return control_threat_link.delete_control_threat_link(db, control_id, threat_id)
