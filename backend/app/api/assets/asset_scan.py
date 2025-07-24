
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.assets import AssetScanCreate, AssetScanRead
from app.crud.assets.asset_scan import (
    create_asset_scan,
    get_asset_scan,
    get_asset_scans,
    update_asset_scan,
    delete_asset_scan,
)
from typing import List

router = APIRouter(
    prefix="/asset_scans",
    tags=["Asset Scan"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AssetScanRead)
def create(obj: AssetScanCreate, db: Session = Depends(get_db)):
    return create_asset_scan(db, obj)

@router.get("/", response_model=List[AssetScanRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_asset_scans(db, skip=skip, limit=limit)

@router.get("/{item_id}", response_model=AssetScanRead)
def read(item_id: int, db: Session = Depends(get_db)):
    obj = get_asset_scan(db, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="AssetScan not found")
    return obj

@router.put("/{item_id}", response_model=AssetScanRead)
def update(item_id: int, data: AssetScanCreate, db: Session = Depends(get_db)):
    updated = update_asset_scan(db, item_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="AssetScan not found")
    return updated

@router.delete("/{item_id}", response_model=dict)
def delete(item_id: int, db: Session = Depends(get_db)):
    success = delete_asset_scan(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="AssetScan not found")
    return {"deleted": True}
