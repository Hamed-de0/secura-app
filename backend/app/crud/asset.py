
from sqlalchemy.orm import Session
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetRead
from typing import List, Optional

def create_asset(db: Session, asset: AssetCreate) -> Asset:
    db_asset = Asset(**asset.dict())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

def get_asset(db: Session, asset_id: int) -> Optional[Asset]:
    return db.query(Asset).filter(Asset.id == asset_id).first()

def get_assets(db: Session, skip: int = 0, limit: int = 100) -> List[Asset]:
    return db.query(Asset).offset(skip).limit(limit).all()

def update_asset(db: Session, asset_id: int, asset_data: AssetCreate) -> Optional[Asset]:
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        return None
    for key, value in asset_data.dict().items():
        setattr(asset, key, value)
    db.commit()
    db.refresh(asset)
    return asset

def delete_asset(db: Session, asset_id: int) -> bool:
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        return False
    db.delete(asset)
    db.commit()
    return True


# from sqlalchemy.orm import Session
# from app.models.asset import Asset
# from app.schemas.asset import AssetCreate
#
# def get_assets(db: Session, skip: int = 0, limit: int = 100):
#     return db.query(Asset).offset(skip).limit(limit).all()
#
# def create_asset(db: Session, asset: AssetCreate):
#     db_asset = Asset(**asset.dict())
#     db.add(db_asset)
#     db.commit()
#     db.refresh(db_asset)
#     return db_asset
