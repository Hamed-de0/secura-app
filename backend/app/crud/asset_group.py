
from sqlalchemy.orm import Session
from app.models.asset import AssetGroup
from app.schemas.asset import AssetGroupCreate
from typing import List, Optional

def create_asset_group(db: Session, obj: AssetGroupCreate) -> AssetGroup:
    db_obj = AssetGroup(**obj.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_asset_group(db: Session, group_id: int) -> Optional[AssetGroup]:
    return db.query(AssetGroup).filter(AssetGroup.id == group_id).first()

def get_asset_groups(db: Session, skip: int = 0, limit: int = 100) -> List[AssetGroup]:
    return db.query(AssetGroup).offset(skip).limit(limit).all()

def update_asset_group(db: Session, group_id: int, obj: AssetGroupCreate) -> Optional[AssetGroup]:
    db_obj = db.query(AssetGroup).filter(AssetGroup.id == group_id).first()
    if not db_obj:
        return None
    for key, value in obj.dict().items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_asset_group(db: Session, group_id: int) -> bool:
    db_obj = db.query(AssetGroup).filter(AssetGroup.id == group_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
