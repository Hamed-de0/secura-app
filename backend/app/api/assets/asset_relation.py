
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.assets import AssetRelationCreate, AssetRelationRead
from app.crud.assets.asset_relation import (
    create_asset_relation,
    get_asset_relation,
    get_asset_relations,
    update_asset_relation,
    delete_asset_relation,
)
from typing import List

router = APIRouter(
    prefix="/asset_relations",
    tags=["Asset Relation"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=AssetRelationRead)
def create(obj: AssetRelationCreate, db: Session = Depends(get_db)):
    return create_asset_relation(db, obj)

@router.get("/", response_model=List[AssetRelationRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_asset_relations(db, skip=skip, limit=limit)

@router.get("/{item_id}", response_model=AssetRelationRead)
def read(item_id: int, db: Session = Depends(get_db)):
    obj = get_asset_relation(db, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="AssetRelation not found")
    return obj

@router.put("/{item_id}", response_model=AssetRelationRead)
def update(item_id: int, data: AssetRelationCreate, db: Session = Depends(get_db)):
    updated = update_asset_relation(db, item_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="AssetRelation not found")
    return updated

@router.delete("/{item_id}", response_model=dict)
def delete(item_id: int, db: Session = Depends(get_db)):
    success = delete_asset_relation(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="AssetRelation not found")
    return {"deleted": True}
