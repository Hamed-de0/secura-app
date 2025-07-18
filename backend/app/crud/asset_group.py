
from sqlalchemy.orm import Session
from app.models.asset import AssetGroup, Asset
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

def build_group_tree(db: Session, parent_id=None) -> List[dict]:
    groups = db.query(AssetGroup).filter(AssetGroup.parent_id == parent_id).all()
    result = []

    for group in groups:
        children = build_group_tree(db, group.id)
        assets = db.query(Asset).filter(Asset.group_id == group.id).all()
        result.append({
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "children": children,
            "assets": [{"id": a.id, "name": a.name} for a in assets]
        })

    return result

def get_asset_group_tree(db: Session) -> List[dict]:
    print('test')
    return build_group_tree(db)