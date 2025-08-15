from fastapi import APIRouter, Depends, Query
from app.database import get_db
from sqlalchemy.orm import Session
from app.schemas.org.business_unit import *
from app.crud.org.business_unit import *

router = APIRouter(prefix="/org", tags=["org"])


# Business Units
@router.get("/business-units", response_model=List[OrgBUOut])
def list_bus(entity_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return OrgBUCRUD.list(db, entity_id)

@router.post("/business-units", response_model=OrgBUOut)
def create_bu(payload: OrgBUCreate, db: Session = Depends(get_db)):
    return OrgBUCRUD.create(db, payload)

@router.get("/business-units/{bu_id}", response_model=OrgBUOut)
def get_bu(bu_id: int, db: Session = Depends(get_db)):
    return OrgBUCRUD.get(db, bu_id)

@router.put("/business-units/{bu_id}", response_model=OrgBUOut)
def update_bu(bu_id: int, payload: OrgBUUpdate, db: Session = Depends(get_db)):
    return OrgBUCRUD.update(db, bu_id, payload)

@router.delete("/business-units/{bu_id}", status_code=204)
def delete_bu(bu_id: int, db: Session = Depends(get_db)):
    OrgBUCRUD.delete(db, bu_id)
    return None
