
from sqlalchemy.orm import Session
from app.models.asset import AssetMaintenance
from app.schemas.asset import AssetMaintenanceCreate
from typing import List, Optional

def create_asset_maintenance(db: Session, obj: AssetMaintenanceCreate) -> AssetMaintenance:
    db_obj = AssetMaintenance(**obj.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_asset_maintenance(db: Session, item_id: int) -> Optional[AssetMaintenance]:
    return db.query(AssetMaintenance).filter(AssetMaintenance.id == item_id).first()

def get_asset_maintenance(db: Session, skip: int = 0, limit: int = 100) -> List[AssetMaintenance]:
    return db.query(AssetMaintenance).offset(skip).limit(limit).all()

def update_asset_maintenance(db: Session, item_id: int, obj: AssetMaintenanceCreate) -> Optional[AssetMaintenance]:
    db_obj = db.query(AssetMaintenance).filter(AssetMaintenance.id == item_id).first()
    if not db_obj:
        return None
    for key, value in obj.dict().items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_asset_maintenance(db: Session, item_id: int) -> bool:
    db_obj = db.query(AssetMaintenance).filter(AssetMaintenance.id == item_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
