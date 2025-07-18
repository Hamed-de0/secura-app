
from sqlalchemy.orm import Session
from app.models.asset import AssetRelation
from app.schemas.asset import AssetRelationCreate
from typing import List, Optional

def create_asset_relation(db: Session, obj: AssetRelationCreate) -> AssetRelation:
    db_obj = AssetRelation(**obj.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_asset_relation(db: Session, item_id: int) -> Optional[AssetRelation]:
    return db.query(AssetRelation).filter(AssetRelation.id == item_id).first()

def get_asset_relations(db: Session, skip: int = 0, limit: int = 100) -> List[AssetRelation]:
    return db.query(AssetRelation).offset(skip).limit(limit).all()

def update_asset_relation(db: Session, item_id: int, obj: AssetRelationCreate) -> Optional[AssetRelation]:
    db_obj = db.query(AssetRelation).filter(AssetRelation.id == item_id).first()
    if not db_obj:
        return None
    for key, value in obj.dict().items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_asset_relation(db: Session, item_id: int) -> bool:
    db_obj = db.query(AssetRelation).filter(AssetRelation.id == item_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
