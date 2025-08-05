
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas.assets import AssetGroupCreate, AssetGroupRead
from app.crud.assets.asset_group import (
    create_asset_group,
    get_asset_group,
    get_asset_groups,
    update_asset_group,
    delete_asset_group,
    get_asset_group_tree
)
from typing import List, Optional
from app.database import get_db

router = APIRouter(
    prefix="/asset-groups",
    tags=["Asset Groups"]
)


@router.post("/", response_model=AssetGroupRead)
def create(obj: AssetGroupCreate, db: Session = Depends(get_db)):
    return create_asset_group(db, obj)

@router.get("/", response_model=List[AssetGroupRead])
def read_all(skip: int = 0, limit: int = 300, db: Session = Depends(get_db), fields: Optional[str] = Query(None),):
    return get_asset_groups(db, skip=skip, limit=limit, fields=fields)

@router.get("/{group_id}", response_model=AssetGroupRead)
def read(group_id: int, db: Session = Depends(get_db)):
    obj = get_asset_group(db, group_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Asset group not found")
    return obj

@router.put("/{group_id}", response_model=AssetGroupRead)
def update(group_id: int, data: AssetGroupCreate, db: Session = Depends(get_db)):
    updated = update_asset_group(db, group_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Asset group not found")
    return updated

@router.delete("/{group_id}", response_model=dict)
def delete(group_id: int, db: Session = Depends(get_db)):
    success = delete_asset_group(db, group_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset group not found")
    return {"deleted": True}

@router.get("/manage/tree", response_model=List[dict])
def read_asset_group_tree(db: Session = Depends(get_db)):
    return get_asset_group_tree(db)