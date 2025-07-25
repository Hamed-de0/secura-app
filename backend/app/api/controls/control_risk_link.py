from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.controls.control_risk_link import ControlRiskLinkCreate
from app.crud.controls import control_risk_link
from app.database import get_db

router = APIRouter(prefix="/control-risk-links", tags=["Control-Risk Links"])


@router.post("/")
def create_link(link: ControlRiskLinkCreate, db: Session = Depends(get_db)):
    return control_risk_link.create_control_risk_link(db, link)


@router.delete("/")
def delete_link(control_id: int, risk_scenario_id: int, db: Session = Depends(get_db)):
    return control_risk_link.delete_control_risk_link(db, control_id, risk_scenario_id)
