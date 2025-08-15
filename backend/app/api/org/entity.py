from fastapi import APIRouter, Depends, Query
from app.database import get_db
from sqlalchemy.orm import Session
from app.schemas.org.entity import *
from app.crud.org.entity import *

router = APIRouter(prefix="/org", tags=["org"])


# Entities
@router.get("/entities", response_model=List[OrgEntityOut])
def list_entities(group_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return OrgEntityCRUD.list(db, group_id)

@router.post("/entities", response_model=OrgEntityOut)
def create_entity(payload: OrgEntityCreate, db: Session = Depends(get_db)):
    return OrgEntityCRUD.create(db, payload)

@router.get("/entities/{entity_id}", response_model=OrgEntityOut)
def get_entity(entity_id: int, db: Session = Depends(get_db)):
    return OrgEntityCRUD.get(db, entity_id)

@router.put("/entities/{entity_id}", response_model=OrgEntityOut)
def update_entity(entity_id: int, payload: OrgEntityUpdate, db: Session = Depends(get_db)):
    return OrgEntityCRUD.update(db, entity_id, payload)

@router.delete("/entities/{entity_id}", status_code=204)
def delete_entity(entity_id: int, db: Session = Depends(get_db)):
    OrgEntityCRUD.delete(db, entity_id)
    return None
