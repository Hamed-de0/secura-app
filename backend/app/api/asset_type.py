
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.asset import AssetTypeCreate, AssetTypeRead
from app.crud.asset_type import (
    create_asset_type,
    get_asset_type,
    get_asset_types,
    update_asset_type,
    delete_asset_type,
)
from typing import List

router = APIRouter(
    prefix="/asset-types",
    tags=["Asset Types"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AssetTypeRead)
def create(obj: AssetTypeCreate, db: Session = Depends(get_db)):
    return create_asset_type(db, obj)

@router.get("/", response_model=List[AssetTypeRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_asset_types(db, skip=skip, limit=limit)

@router.get("/{type_id}", response_model=AssetTypeRead)
def read(type_id: int, db: Session = Depends(get_db)):
    obj = get_asset_type(db, type_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Asset type not found")
    return obj

@router.put("/{type_id}", response_model=AssetTypeRead)
def update(type_id: int, data: AssetTypeCreate, db: Session = Depends(get_db)):
    updated = update_asset_type(db, type_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Asset type not found")
    return updated

@router.delete("/{type_id}", response_model=dict)
def delete(type_id: int, db: Session = Depends(get_db)):
    success = delete_asset_type(db, type_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset type not found")
    return {"deleted": True}
