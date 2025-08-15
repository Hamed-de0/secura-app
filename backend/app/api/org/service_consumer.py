from fastapi import APIRouter, Depends, Query
from app.database import get_db
from sqlalchemy.orm import Session
from app.schemas.org.service_consumer import *
from app.crud.org.service_consumer import *

router = APIRouter(prefix="/org", tags=["org"])


# Service Consumers
@router.get("/service-consumers", response_model=List[OrgServiceConsumerOut])
def list_service_consumers(
    service_id: Optional[int] = Query(None),
    consumer_entity_id: Optional[int] = Query(None),
    consumer_bu_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return OrgServiceConsumerCRUD.list(db, service_id, consumer_entity_id, consumer_bu_id)

@router.post("/service-consumers", response_model=OrgServiceConsumerOut)
def create_service_consumer(payload: OrgServiceConsumerCreate, db: Session = Depends(get_db)):
    return OrgServiceConsumerCRUD.create(db, payload)

@router.get("/service-consumers/{link_id}", response_model=OrgServiceConsumerOut)
def get_service_consumer(link_id: int, db: Session = Depends(get_db)):
    return OrgServiceConsumerCRUD.get(db, link_id)

@router.put("/service-consumers/{link_id}", response_model=OrgServiceConsumerOut)
def update_service_consumer(link_id: int, payload: OrgServiceConsumerUpdate, db: Session = Depends(get_db)):
    return OrgServiceConsumerCRUD.update(db, link_id, payload)

@router.delete("/service-consumers/{link_id}", status_code=204)
def delete_service_consumer(link_id: int, db: Session = Depends(get_db)):
    OrgServiceConsumerCRUD.delete(db, link_id)
    return None
