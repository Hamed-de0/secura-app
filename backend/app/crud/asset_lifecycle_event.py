
from sqlalchemy.orm import Session
from app.models.asset import AssetLifecycleEvent
from app.schemas.asset import AssetLifecycleEventCreate
from typing import List, Optional

def create_asset_lifecycle_event(db: Session, obj: AssetLifecycleEventCreate) -> AssetLifecycleEvent:
    db_obj = AssetLifecycleEvent(**obj.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_asset_lifecycle_event(db: Session, item_id: int) -> Optional[AssetLifecycleEvent]:
    return db.query(AssetLifecycleEvent).filter(AssetLifecycleEvent.id == item_id).first()

def get_asset_lifecycle_events(db: Session, skip: int = 0, limit: int = 100) -> List[AssetLifecycleEvent]:
    return db.query(AssetLifecycleEvent).offset(skip).limit(limit).all()

def update_asset_lifecycle_event(db: Session, item_id: int, obj: AssetLifecycleEventCreate) -> Optional[AssetLifecycleEvent]:
    db_obj = db.query(AssetLifecycleEvent).filter(AssetLifecycleEvent.id == item_id).first()
    if not db_obj:
        return None
    for key, value in obj.dict().items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_asset_lifecycle_event(db: Session, item_id: int) -> bool:
    db_obj = db.query(AssetLifecycleEvent).filter(AssetLifecycleEvent.id == item_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
