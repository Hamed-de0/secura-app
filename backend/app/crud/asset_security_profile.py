
from sqlalchemy.orm import Session
from app.models.asset import AssetSecurityProfile
from app.schemas.asset import AssetSecurityProfileCreate
from typing import List, Optional

def create_asset_security_profile(db: Session, obj: AssetSecurityProfileCreate) -> AssetSecurityProfile:
    db_obj = AssetSecurityProfile(**obj.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_asset_security_profile(db: Session, item_id: int) -> Optional[AssetSecurityProfile]:
    return db.query(AssetSecurityProfile).filter(AssetSecurityProfile.id == item_id).first()

def get_asset_security_profiles(db: Session, skip: int = 0, limit: int = 100) -> List[AssetSecurityProfile]:
    return db.query(AssetSecurityProfile).offset(skip).limit(limit).all()

def update_asset_security_profile(db: Session, item_id: int, obj: AssetSecurityProfileCreate) -> Optional[AssetSecurityProfile]:
    db_obj = db.query(AssetSecurityProfile).filter(AssetSecurityProfile.id == item_id).first()
    if not db_obj:
        return None
    for key, value in obj.dict().items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_asset_security_profile(db: Session, item_id: int) -> bool:
    db_obj = db.query(AssetSecurityProfile).filter(AssetSecurityProfile.id == item_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
