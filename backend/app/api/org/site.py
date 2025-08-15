from fastapi import APIRouter, Depends, Query
from app.database import get_db
from sqlalchemy.orm import Session
from app.schemas.org.site import *
from app.crud.org.site import *

router = APIRouter(prefix="/org", tags=["org"])


# Sites
@router.get("/sites", response_model=List[OrgSiteOut])
def list_sites(entity_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return OrgSiteCRUD.list(db, entity_id)

@router.post("/sites", response_model=OrgSiteOut)
def create_site(payload: OrgSiteCreate, db: Session = Depends(get_db)):
    return OrgSiteCRUD.create(db, payload)

@router.get("/sites/{site_id}", response_model=OrgSiteOut)
def get_site(site_id: int, db: Session = Depends(get_db)):
    return OrgSiteCRUD.get(db, site_id)

@router.put("/sites/{site_id}", response_model=OrgSiteOut)
def update_site(site_id: int, payload: OrgSiteUpdate, db: Session = Depends(get_db)):
    return OrgSiteCRUD.update(db, site_id, payload)

@router.delete("/sites/{site_id}", status_code=204)
def delete_site(site_id: int, db: Session = Depends(get_db)):
    OrgSiteCRUD.delete(db, site_id)
    return None

