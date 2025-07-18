
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.asset import AssetSecurityProfileCreate, AssetSecurityProfileRead
from app.crud.asset_security_profile import (
    create_asset_security_profile,
    get_asset_security_profile,
    get_asset_security_profiles,
    update_asset_security_profile,
    delete_asset_security_profile,
)
from typing import List

router = APIRouter(
    prefix="/asset_security_profiles",
    tags=["Asset SecurityProfile"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AssetSecurityProfileRead)
def create(obj: AssetSecurityProfileCreate, db: Session = Depends(get_db)):
    return create_asset_security_profile(db, obj)

@router.get("/", response_model=List[AssetSecurityProfileRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_asset_security_profiles(db, skip=skip, limit=limit)

@router.get("/{item_id}", response_model=AssetSecurityProfileRead)
def read(item_id: int, db: Session = Depends(get_db)):
    obj = get_asset_security_profile(db, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="AssetSecurityProfile not found")
    return obj

@router.put("/{item_id}", response_model=AssetSecurityProfileRead)
def update(item_id: int, data: AssetSecurityProfileCreate, db: Session = Depends(get_db)):
    updated = update_asset_security_profile(db, item_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="AssetSecurityProfile not found")
    return updated

@router.delete("/{item_id}", response_model=dict)
def delete(item_id: int, db: Session = Depends(get_db)):
    success = delete_asset_security_profile(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="AssetSecurityProfile not found")
    return {"deleted": True}
