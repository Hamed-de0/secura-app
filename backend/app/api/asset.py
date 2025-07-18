
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.asset import AssetCreate, AssetRead
from app.crud.asset import create_asset, get_asset, get_assets, update_asset, delete_asset
from typing import List

router = APIRouter(
    prefix="/assets",
    tags=["Assets"]
)

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
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_assets(db, skip=skip, limit=limit)

@router.get("/{asset_id}", response_model=AssetRead)
def read(asset_id: int, db: Session = Depends(get_db)):
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


# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.schemas.asset import AssetCreate, AssetRead
# from app.crud.asset import get_assets, create_asset
# from app.database import SessionLocal
# from typing import List
#
# router = APIRouter(
#     prefix="/assets",
#     tags=["Assets"]
# )
#
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()
#
# @router.get("/", response_model=List[AssetRead])
# def read_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     return get_assets(db, skip=skip, limit=limit)
#
# @router.post("/", response_model=AssetRead)
# def add_asset(asset: AssetCreate, db: Session = Depends(get_db)):
#     return create_asset(db, asset)
