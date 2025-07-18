
from sqlalchemy.orm import Session
from app.models.asset import Asset, AssetRelation
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

def get_assets_with_children(db: Session) -> List[Asset]:
    def build_tree(parent_id):
        relations = db.query(AssetRelation).filter(
            AssetRelation.asset_id == parent_id,
            AssetRelation.relation_type == 'parent'
        ).all()

        children = []
        for rel in relations:
            child = db.query(Asset).filter(Asset.id == rel.related_asset_id).first()
            if child:
                child.children = build_tree(child.id)
                children.append(child)
        return children

    all_assets = db.query(Asset).all()

    # Find top-level assets (not listed as related_asset_id in any relation)
    child_ids = {
        rel.related_asset_id
        for rel in db.query(AssetRelation).filter(AssetRelation.relation_type == 'parent')
    }

    top_level_assets = [a for a in all_assets if a.id not in child_ids]

    for asset in top_level_assets:
        asset.children = build_tree(asset.id)

    return top_level_assets

def get_asset_with_children(db: Session, asset_id: int) -> Optional[Asset]:
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        return None

    def build_tree(parent_id):
        relations = db.query(AssetRelation).filter(
            AssetRelation.asset_id == parent_id,
            AssetRelation.relation_type == 'parent'
        ).all()

        children = []
        for rel in relations:
            child = db.query(Asset).filter(Asset.id == rel.related_asset_id).first()
            if child:
                child.children = build_tree(child.id)  # 👈 recursively attach children
                children.append(child)
        return children

    asset.children = build_tree(asset.id)
    return asset
