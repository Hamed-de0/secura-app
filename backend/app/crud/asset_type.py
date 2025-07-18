
from sqlalchemy.orm import Session
from app.models.asset import AssetType
from app.schemas.asset import AssetTypeCreate
from typing import List, Optional

def create_asset_type(db: Session, obj: AssetTypeCreate) -> AssetType:
    db_obj = AssetType(**obj.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_asset_type(db: Session, type_id: int) -> Optional[AssetType]:
    return db.query(AssetType).filter(AssetType.id == type_id).first()

def get_asset_types(db: Session, skip: int = 0, limit: int = 100) -> List[AssetType]:
    return db.query(AssetType).offset(skip).limit(limit).all()

def update_asset_type(db: Session, type_id: int, obj: AssetTypeCreate) -> Optional[AssetType]:
    db_obj = db.query(AssetType).filter(AssetType.id == type_id).first()
    if not db_obj:
        return None
    for key, value in obj.dict().items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_asset_type(db: Session, type_id: int) -> bool:
    db_obj = db.query(AssetType).filter(AssetType.id == type_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
