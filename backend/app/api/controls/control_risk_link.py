from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.controls.control_risk_link import ControlRiskLinkCreate, ControlRiskLinkRead, ControlRiskLinkUpdate
from app.crud.controls.control_risk_link import (
create_control_risk_link,
    get_control_risk_links,
    get_links_by_risk_scenario,
    get_links_by_risk_control,
    update_control_risk_link,
    delete_control_risk_link,
    upsert_control_risk_link
)
from app.database import get_db
from typing import List


router = APIRouter(prefix="/control-risk-links", tags=["Control-Risk Links"])


@router.post("/", response_model=ControlRiskLinkRead)
def create_link(link: ControlRiskLinkCreate, db: Session = Depends(get_db)):
    return upsert_control_risk_link(db, link)


@router.get("/", response_model=List[ControlRiskLinkRead])
def read_all_links(db: Session = Depends(get_db)):
    return get_control_risk_links(db)


@router.get("/by-scenario/{scenario_id}", response_model=List[ControlRiskLinkRead])
def read_links_by_risk_scenario(scenario_id: int, db: Session = Depends(get_db)):
    return get_links_by_risk_scenario(db, scenario_id)

@router.get("/by-control/{control_id}", response_model=List[ControlRiskLinkRead])
def read_links_by_risk_control(control_id: int, db: Session = Depends(get_db)):
    return get_links_by_risk_control(db, control_id)


@router.put("/{link_id}", response_model=ControlRiskLinkRead)
def update_link(link_id: int, update: ControlRiskLinkUpdate, db: Session = Depends(get_db)):
    updated = update_control_risk_link(db, link_id, update)
    if not updated:
        raise HTTPException(status_code=404, detail="Link not found")
    return updated


@router.delete("/{link_id}")
def delete_link(link_id: int, db: Session = Depends(get_db)):
    success = delete_control_risk_link(db, link_id)
    if not success:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"detail": "Deleted"}