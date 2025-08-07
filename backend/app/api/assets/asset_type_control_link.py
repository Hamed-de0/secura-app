from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.assets.asset_type_control_link import AssetTypeControlLinkCreate, AssetTypeControlLinkOut
from app.crud.assets import asset_type_control_link

router = APIRouter(prefix="/asset-type-control-link", tags=["Asset Type ↔ Control"])

@router.post("/", response_model=AssetTypeControlLinkOut)
def create_link(link: AssetTypeControlLinkCreate, db: Session = Depends(get_db)):
    return asset_type_control_link.create_link(db, link)

@router.get("/by-asset-type/{asset_type_id}", response_model=list[AssetTypeControlLinkOut])
def get_links(asset_type_id: int, db: Session = Depends(get_db)):
    return asset_type_control_link.get_links_by_asset_type(db, asset_type_id)

@router.delete("/{link_id}")
def delete_link(link_id: int, db: Session = Depends(get_db)):
    asset_type_control_link.delete_link(db, link_id)
    return {"message": "Link deleted"}
