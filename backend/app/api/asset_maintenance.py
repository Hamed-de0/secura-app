
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.asset import AssetMaintenanceCreate, AssetMaintenanceRead
from app.crud.asset_maintenance import (
    create_asset_maintenance,
    get_asset_maintenance,
    get_asset_maintenance,
    update_asset_maintenance,
    delete_asset_maintenance,
)
from typing import List

router = APIRouter(
    prefix="/asset_maintenance",
    tags=["Asset Maintenance"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AssetMaintenanceRead)
def create(obj: AssetMaintenanceCreate, db: Session = Depends(get_db)):
    return create_asset_maintenance(db, obj)

@router.get("/", response_model=List[AssetMaintenanceRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_asset_maintenance(db, skip=skip, limit=limit)

@router.get("/{item_id}", response_model=AssetMaintenanceRead)
def read(item_id: int, db: Session = Depends(get_db)):
    obj = get_asset_maintenance(db, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="AssetMaintenance not found")
    return obj

@router.put("/{item_id}", response_model=AssetMaintenanceRead)
def update(item_id: int, data: AssetMaintenanceCreate, db: Session = Depends(get_db)):
    updated = update_asset_maintenance(db, item_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="AssetMaintenance not found")
    return updated

@router.delete("/{item_id}", response_model=dict)
def delete(item_id: int, db: Session = Depends(get_db)):
    success = delete_asset_maintenance(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="AssetMaintenance not found")
    return {"deleted": True}
