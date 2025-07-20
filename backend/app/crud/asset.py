
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

def get_all_descendant_ids(db: Session, parent_id: int) -> list[int]:
    descendants = []
    child_relations = db.query(AssetRelation).filter(
        AssetRelation.asset_id == parent_id,
        AssetRelation.relation_type == "parent"
    ).all()
    for rel in child_relations:
        descendants.append(rel.related_asset_id)
        descendants.extend(get_all_descendant_ids(db, rel.related_asset_id))
    return descendants

def delete_asset_and_descendants(db: Session, asset_id: int):
    # Find children
    children = get_all_descendant_ids(db, asset_id)

    # If asset has NO children, but IS a child in another relation → delete only relation
    if not children:
        db.query(AssetRelation).filter(
            AssetRelation.related_asset_id == asset_id
        ).delete()
        db.commit()
        return {"message": f"Asset relation to asset {asset_id} deleted (no children)"}

    # Else: delete children first (bottom-up)
    all_to_delete = [asset_id] + children

    # Delete relations
    db.query(AssetRelation).filter(
        AssetRelation.asset_id.in_(all_to_delete) |
        AssetRelation.related_asset_id.in_(all_to_delete)
    ).delete(synchronize_session=False)

    # Delete assets
    db.query(Asset).filter(Asset.id.in_(all_to_delete)).delete(synchronize_session=False)

    db.commit()
    return {"message": f"Asset {asset_id} and all descendants deleted"}



