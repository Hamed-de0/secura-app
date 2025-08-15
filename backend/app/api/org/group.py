from fastapi import APIRouter, Depends, Query
from app.database import get_db
from sqlalchemy.orm import Session
from app.schemas.org.group import *
from app.crud.org.group import *

router = APIRouter(prefix="/org", tags=["org"])

# Groups
@router.get("/groups", response_model=List[OrgGroupOut])
def list_groups(db: Session = Depends(get_db)):
    return OrgGroupCRUD.list(db)

@router.post("/groups", response_model=OrgGroupOut)
def create_group(payload: OrgGroupCreate, db: Session = Depends(get_db)):
    return OrgGroupCRUD.create(db, payload)

@router.get("/groups/{group_id}", response_model=OrgGroupOut)
def get_group(group_id: int, db: Session = Depends(get_db)):
    return OrgGroupCRUD.get(db, group_id)

@router.put("/groups/{group_id}", response_model=OrgGroupOut)
def update_group(group_id: int, payload: OrgGroupUpdate, db: Session = Depends(get_db)):
    return OrgGroupCRUD.update(db, group_id, payload)

@router.delete("/groups/{group_id}", status_code=204)
def delete_group(group_id: int, db: Session = Depends(get_db)):
    OrgGroupCRUD.delete(db, group_id)
    return None

