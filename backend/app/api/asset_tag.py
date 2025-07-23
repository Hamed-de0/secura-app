from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.schemas.asset import AssetTagCreate, AssetTagRead, AssetTagUpdate
from app.crud import asset_tag as crud

router = APIRouter(
    prefix="/asset-tags",
    tags=["Asset Tags"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[AssetTagRead])
def read_all_tags(db: Session = Depends(get_db)):
    return crud.get_all_asset_tags(db)


@router.get("/{tag_id}", response_model=AssetTagRead)
def read_tag(tag_id: int, db: Session = Depends(get_db)):
    tag = crud.get_asset_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.post("/", response_model=AssetTagRead)
def create_tag(tag_data: AssetTagCreate, db: Session = Depends(get_db)):
    return crud.create_asset_tag(db, tag_data)


@router.put("/{tag_id}", response_model=AssetTagRead)
def update_tag(tag_id: int, tag_data: AssetTagUpdate, db: Session = Depends(get_db)):
    tag = crud.update_asset_tag(db, tag_id, tag_data)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.delete("/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    success = crud.delete_asset_tag(db, tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {"ok": True}


# Asset_Tag_Link actions
@router.get("/assets/{asset_id}/tags", response_model=List[AssetTagRead])
def read_tags_for_asset(asset_id: int, db: Session = Depends(get_db)):
    tags = crud.get_tags_for_asset(db, asset_id)
    if tags is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return tags


@router.post("/assets/{asset_id}/tags/{tag_id}", response_model=AssetTagRead)
def add_tag_to_asset(asset_id: int, tag_id: int, db: Session = Depends(get_db)):
    tag = crud.add_tag_to_asset(db, asset_id, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Asset or Tag not found")
    return tag


@router.delete("/assets/{asset_id}/tags/{tag_id}")
def remove_tag_from_asset(asset_id: int, tag_id: int, db: Session = Depends(get_db)):
    success = crud.remove_tag_from_asset(db, asset_id, tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset or Tag not found")
    return {"ok": True}