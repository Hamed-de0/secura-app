from fastapi import APIRouter, Depends, Query
from app.database import get_db
from sqlalchemy.orm import Session
from app.schemas.org.service import *
from app.crud.org.service import *

router = APIRouter(prefix="/org", tags=["org"])


# Services
@router.get("/services", response_model=List[OrgServiceOut])
def list_services(provider_entity_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return OrgServiceCRUD.list(db, provider_entity_id)

@router.post("/services", response_model=OrgServiceOut)
def create_service(payload: OrgServiceCreate, db: Session = Depends(get_db)):
    return OrgServiceCRUD.create(db, payload)

@router.get("/services/{service_id}", response_model=OrgServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)):
    return OrgServiceCRUD.get(db, service_id)

@router.put("/services/{service_id}", response_model=OrgServiceOut)
def update_service(service_id: int, payload: OrgServiceUpdate, db: Session = Depends(get_db)):
    return OrgServiceCRUD.update(db, service_id, payload)

@router.delete("/services/{service_id}", status_code=204)
def delete_service(service_id: int, db: Session = Depends(get_db)):
    OrgServiceCRUD.delete(db, service_id)
    return None

