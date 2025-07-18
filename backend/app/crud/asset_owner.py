
from sqlalchemy.orm import Session
from app.models.asset import AssetOwner
from app.schemas.asset import AssetOwnerCreate
from typing import List, Optional

def create_asset_owner(db: Session, obj: AssetOwnerCreate) -> AssetOwner:
    db_obj = AssetOwner(**obj.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_asset_owner(db: Session, owner_id: int) -> Optional[AssetOwner]:
    return db.query(AssetOwner).filter(AssetOwner.id == owner_id).first()

def get_asset_owners(db: Session, skip: int = 0, limit: int = 100) -> List[AssetOwner]:
    return db.query(AssetOwner).offset(skip).limit(limit).all()

def update_asset_owner(db: Session, owner_id: int, obj: AssetOwnerCreate) -> Optional[AssetOwner]:
    db_obj = db.query(AssetOwner).filter(AssetOwner.id == owner_id).first()
    if not db_obj:
        return None
    for key, value in obj.dict().items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_asset_owner(db: Session, owner_id: int) -> bool:
    db_obj = db.query(AssetOwner).filter(AssetOwner.id == owner_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
