from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.assets.asset_type_threat_link import AssetTypeThreatLinkCreate, AssetTypeThreatLinkOut, AssetTypeThreatLinkOutDetails
from app.crud.assets import asset_type_threat_link
from typing import List

router = APIRouter(prefix="/asset-type-threat-link", tags=["Asset Type ↔ Threat"])

@router.post("/", response_model=AssetTypeThreatLinkOut)
def create_link(link: AssetTypeThreatLinkCreate, db: Session = Depends(get_db)):
    return asset_type_threat_link.create_link(db, link)

@router.post("/bulk-insert", response_model=List[AssetTypeThreatLinkOut])
def create_link(link: List[AssetTypeThreatLinkCreate], db: Session = Depends(get_db)):
    return [asset_type_threat_link.create_link(db, r) for r in link if r is not None]

@router.get("/by-asset-type/{asset_type_id}/by-name", response_model=list[AssetTypeThreatLinkOutDetails])
def get_links(asset_type_id: int, db: Session = Depends(get_db)):
    return asset_type_threat_link.get_links_by_asset_type_details(db, asset_type_id)

@router.get("/by-asset-type/{asset_type_id}", response_model=list[AssetTypeThreatLinkOut])
def get_links(asset_type_id: int, db: Session = Depends(get_db)):
    return asset_type_threat_link.get_links_by_asset_type(db, asset_type_id)

@router.get("/by-threat/{threat_id}/by-name", response_model=list[AssetTypeThreatLinkOut])
def get_links(asset_type_id: int, db: Session = Depends(get_db)):
    return asset_type_threat_link.get_links_by_asset_type(db, asset_type_id)

@router.get("/by-threat/{threat_id}", response_model=list[AssetTypeThreatLinkOut])
def get_links(asset_type_id: int, db: Session = Depends(get_db)):
    return asset_type_threat_link.get_links_by_asset_type(db, asset_type_id)

@router.delete("/{link_id}")
def delete_link(link_id: int, db: Session = Depends(get_db)):
    asset_type_threat_link.delete_link(db, link_id)
    return {"message": "Link deleted"}
