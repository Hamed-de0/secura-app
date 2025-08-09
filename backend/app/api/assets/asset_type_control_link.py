from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.assets.asset_type_control_link import AssetTypeControlLinkCreate, AssetTypeControlLinkOut, AssetTypeControlLinkOutDetails
from app.crud.assets.asset_type_control_link import create_link, delete_link, get_links_by_asset_type, get_links_by_asset_type_details

router = APIRouter(prefix="/asset-type-control-link", tags=["Asset Type ↔ Control"])

@router.post("/", response_model=AssetTypeControlLinkOut)
def add_link(payload: AssetTypeControlLinkCreate, db: Session = Depends(get_db)):
    link = create_link(
        db,
        asset_type_id=payload.asset_type_id,
        control_id=payload.control_id,
        score=payload.score,
        justification=payload.justification,
    )
    return link


@router.get("/by-asset-type/{asset_type_id}/by-name", response_model=list[AssetTypeControlLinkOutDetails])
def get_links(asset_type_id: int, db: Session = Depends(get_db)):
    return get_links_by_asset_type_details(db, asset_type_id)

@router.get("/by-asset-type/{asset_type_id}", response_model=list[AssetTypeControlLinkOut])
def get_links(asset_type_id: int, db: Session = Depends(get_db)):
    return get_links_by_asset_type(db, asset_type_id)

@router.delete("/{link_id}")
def delete_link(link_id: int, db: Session = Depends(get_db)):
    delete_link(db, link_id)
    return {"message": "Link deleted"}
