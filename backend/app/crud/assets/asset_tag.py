from sqlalchemy.orm import Session
from app.models.assets import AssetTag, Asset
from app.schemas.assets import AssetTagCreate, AssetTagUpdate
from typing import List, Optional


def get_all_asset_tags(db: Session) -> List[AssetTag]:
    return db.query(AssetTag).all()


def get_asset_tag_by_id(db: Session, tag_id: int) -> Optional[AssetTag]:
    return db.query(AssetTag).filter(AssetTag.id == tag_id).first()


def create_asset_tag(db: Session, tag_data: AssetTagCreate) -> AssetTag:
    tag = AssetTag(**tag_data.model_dump())
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def update_asset_tag(db: Session, tag_id: int, tag_data: AssetTagUpdate) -> Optional[AssetTag]:
    tag = db.query(AssetTag).filter(AssetTag.id == tag_id).first()
    if not tag:
        return None

    for field, value in tag_data.model_dump(exclude_unset=True).items():
        setattr(tag, field, value)

    db.commit()
    db.refresh(tag)
    return tag


def delete_asset_tag(db: Session, tag_id: int) -> bool:
    tag = db.query(AssetTag).filter(AssetTag.id == tag_id).first()
    if not tag:
        return False

    db.delete(tag)
    db.commit()
    return True


def get_tags_for_asset(db: Session, asset_id: int):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        return None
    return asset.tags


def add_tag_to_asset(db: Session, asset_id: int, tag_id: int):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    tag = db.query(AssetTag).filter(AssetTag.id == tag_id).first()

    if not asset or not tag:
        return None

    if tag not in asset.tags:
        asset.tags.append(tag)
        db.commit()
        db.refresh(asset)
    return tag


def remove_tag_from_asset(db: Session, asset_id: int, tag_id: int):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    tag = db.query(AssetTag).filter(AssetTag.id == tag_id).first()

    if not asset or not tag:
        return False

    if tag in asset.tags:
        asset.tags.remove(tag)
        db.commit()
    return True