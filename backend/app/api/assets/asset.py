
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.assets import *
from app.crud.assets.asset import (create_asset, get_asset, get_assets, update_asset, delete_asset,
                                   get_assets_with_children, get_asset_with_children, delete_asset_and_descendants)
from typing import List
import logging
router = APIRouter(
    prefix="/assets",
    tags=["Assets"]
)

logger = logging.getLogger(__name__)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AssetRead)
def create(asset: AssetCreate, db: Session = Depends(get_db)):
    return create_asset(db, asset)

@router.get("/", response_model=List[AssetRead])
def read_all(
    skip: int = 0,
    limit: int = 100,
    include_children: bool = Query(False, description="Include related child assets"),
    db: Session = Depends(get_db)
):

    if include_children:
        return get_assets_with_children(db)
    return get_assets(db, skip=skip, limit=limit)

@router.get("/{asset_id}", response_model=AssetRead)
def read(
    asset_id: int,
    include_children: bool = Query(False, description="Include children of this asset"),
    db: Session = Depends(get_db)
):
    if include_children:
        asset = get_asset_with_children(db, asset_id)
    else:
        asset = get_asset(db, asset_id)

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.put("/{asset_id}", response_model=AssetRead)
def update(asset_id: int, asset_data: AssetCreate, db: Session = Depends(get_db)):
    updated = update_asset(db, asset_id, asset_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Asset not found")
    return updated

@router.delete("/{asset_id}", response_model=dict)
def delete(asset_id: int, db: Session = Depends(get_db)):
    success = delete_asset(db, asset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"deleted": True}

@router.delete("/{asset_id}/cascade")
def delete_cascade(asset_id: int, db: Session = Depends(get_db)):
    success = delete_asset_and_descendants(db, asset_id)
    if not success:
        raise HTTPException(status_code=500, detail="internal error")

    return {"deleted": True}

