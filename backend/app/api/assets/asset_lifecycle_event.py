
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.assets import AssetLifecycleEventCreate, AssetLifecycleEventRead
from app.crud.assets.asset_lifecycle_event import (
    create_asset_lifecycle_event,
    get_asset_lifecycle_event,
    get_asset_lifecycle_events,
    update_asset_lifecycle_event,
    delete_asset_lifecycle_event,
)
from typing import List

router = APIRouter(
    prefix="/asset_lifecycle_events",
    tags=["Asset LifecycleEvent"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AssetLifecycleEventRead)
def create(obj: AssetLifecycleEventCreate, db: Session = Depends(get_db)):
    return create_asset_lifecycle_event(db, obj)

@router.get("/", response_model=List[AssetLifecycleEventRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_asset_lifecycle_events(db, skip=skip, limit=limit)

@router.get("/{item_id}", response_model=AssetLifecycleEventRead)
def read(item_id: int, db: Session = Depends(get_db)):
    obj = get_asset_lifecycle_event(db, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="AssetLifecycleEvent not found")
    return obj

@router.put("/{item_id}", response_model=AssetLifecycleEventRead)
def update(item_id: int, data: AssetLifecycleEventCreate, db: Session = Depends(get_db)):
    updated = update_asset_lifecycle_event(db, item_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="AssetLifecycleEvent not found")
    return updated

@router.delete("/{item_id}", response_model=dict)
def delete(item_id: int, db: Session = Depends(get_db)):
    success = delete_asset_lifecycle_event(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="AssetLifecycleEvent not found")
    return {"deleted": True}
