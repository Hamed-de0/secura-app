
from sqlalchemy.orm import Session
from app.models.assets import AssetScan
from app.schemas.assets import AssetScanCreate
from typing import List, Optional

def create_asset_scan(db: Session, obj: AssetScanCreate) -> AssetScan:
    db_obj = AssetScan(**obj.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_asset_scan(db: Session, item_id: int) -> Optional[AssetScan]:
    return db.query(AssetScan).filter(AssetScan.id == item_id).first()

def get_asset_scans(db: Session, skip: int = 0, limit: int = 100) -> List[AssetScan]:
    return db.query(AssetScan).offset(skip).limit(limit).all()

def update_asset_scan(db: Session, item_id: int, obj: AssetScanCreate) -> Optional[AssetScan]:
    db_obj = db.query(AssetScan).filter(AssetScan.id == item_id).first()
    if not db_obj:
        return None
    for key, value in obj.dict().items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_asset_scan(db: Session, item_id: int) -> bool:
    db_obj = db.query(AssetScan).filter(AssetScan.id == item_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
