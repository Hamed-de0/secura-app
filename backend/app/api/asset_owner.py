
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.asset import AssetOwnerCreate, AssetOwnerRead
from app.crud.asset_owner import (
    create_asset_owner,
    get_asset_owner,
    get_asset_owners,
    update_asset_owner,
    delete_asset_owner,
    get_asset_owners_name
)
from typing import List, Optional

router = APIRouter(
    prefix="/asset-owners",
    tags=["Asset Owners"],

)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AssetOwnerRead)
def create(obj: AssetOwnerCreate, db: Session = Depends(get_db)):
    return create_asset_owner(db, obj)

@router.get("/", response_model=List[AssetOwnerRead])
def read_all(asset_id: Optional[int] = Query(None),
            person_id: Optional[int] = Query(None),
             skip: int = 0, limit: int = 100,
             db: Session = Depends(get_db)):
    # return get_asset_owners(db, skip=skip, limit=limit)
    return  get_asset_owners_name(db,asset_id=asset_id, person_id=person_id)

@router.get("/{owner_id}", response_model=AssetOwnerRead)
def read(owner_id: int, db: Session = Depends(get_db)):
    obj = get_asset_owner(db, owner_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Asset owner not found")
    return obj

@router.put("/{owner_id}", response_model=AssetOwnerRead)
def update(owner_id: int, data: AssetOwnerCreate, db: Session = Depends(get_db)):
    updated = update_asset_owner(db, owner_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Asset owner not found")
    return updated

@router.delete("/{owner_id}", response_model=dict)
def delete(owner_id: int, db: Session = Depends(get_db)):
    success = delete_asset_owner(db, owner_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset owner not found")
    return {"deleted": True}
