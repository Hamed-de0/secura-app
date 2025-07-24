
from sqlalchemy.orm import Session
from app.models.assets import AssetGroup, Asset, AssetRelation
from app.schemas.assets import AssetGroupCreate
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

"""
def build_group_tree(db: Session, parent_id=None) -> List[dict]:
    groups = db.query(AssetGroup).filter(AssetGroup.parent_id == parent_id).all()
    result = []

    for group in groups:
        children = build_group_tree(db, group.id)
        assets = db.query(Asset).filter(Asset.group_id == group.id).all()
        # assets = get_assets_with_children(db)
        if assets:
            print('ASSETS IN', assets)
        result.append({
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "children": children,
            "assets": [{"id": a.id, "name": a.name, "description": a.description, "group_id": a.group_id} for a in assets]
        })

    return result
"""

# def get_asset_group_tree(db: Session) -> List[dict]:
#     print('test')
#     return build_group_tree(db)

def build_asset_tree(db: Session, asset_id: int) -> dict:
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        return {}

    children_rel = db.query(AssetRelation).filter(
        AssetRelation.asset_id == asset_id,
        AssetRelation.relation_type == "parent"
    ).all()

    children = []
    for rel in children_rel:
        child_asset = build_asset_tree(db, rel.related_asset_id)
        if child_asset:
            children.append(child_asset)

    return {
        "type": "asset",
        "id": asset.id,
        "name": asset.name,
        "description": asset.description,
        "group_id": asset.group_id,
        "children": children
    }


def build_group_tree(db: Session, parent_id=None) -> List[dict]:
    groups = db.query(AssetGroup).filter(AssetGroup.parent_id == parent_id).all()
    result = []

    # Get all child asset IDs (to avoid duplication at top-level)
    child_ids = [c[0] for c in db.query(AssetRelation.related_asset_id).distinct().all()]

    for group in groups:
        children = build_group_tree(db, group.id)

        assets = db.query(Asset).filter(
            Asset.group_id == group.id,
            ~Asset.id.in_(child_ids)
        ).all()

        asset_entries = [build_asset_tree(db, a.id) for a in assets]

        result.append({
            "type": "group",
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "children": children,
            "assets": asset_entries
        })

    return result


"""
def build_asset_tree(db: Session, parent_id=None) -> dict:
    groups = db.query(AssetGroup).filter(AssetGroup.parent_id == parent_id).all()
    result = []

    # 🔍 Collect all asset IDs that are children in any relationship
    child_ids = [c[0] for c in db.query(AssetRelation.related_asset_id).distinct().all()]

    for group in groups:
        children = build_group_tree(db, group.id)

        # ✅ Filter: Only include top-level assets in this group
        assets = db.query(Asset).filter(
            Asset.group_id == group.id,
            ~Asset.id.in_(child_ids)  # Not a child of any asset
        ).all()

        asset_entries = []
        for a in assets:
            asset_entries.append(build_asset_tree(db, a.id))

        result.append({
            "type": "group",
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "children": children,
            "assets": asset_entries
        })

    return result
    # asset = db.query(Asset).filter(Asset.id == asset_id).first()
    # if not asset:
    #     return {}
    #
    # children_rel = db.query(AssetRelation).filter(
    #     AssetRelation.asset_id == asset_id,
    #     AssetRelation.relation_type == "parent"
    # ).all()
    #
    # children = []
    # for rel in children_rel:
    #     child_asset = build_asset_tree(db, rel.related_asset_id)
    #     if child_asset:
    #         children.append(child_asset)
    #
    # return {
    #     "type": "asset",
    #     "id": asset.id,
    #     "name": asset.name,
    #     "description": asset.description,
    #     "group_id": asset.group_id,
    #     "children": children
    # }

def build_group_tree(db: Session, parent_id=None) -> List[dict]:
    groups = db.query(AssetGroup).filter(AssetGroup.parent_id == parent_id).all()
    result = []

    for group in groups:
        children = build_group_tree(db, group.id)
        assets = db.query(Asset).filter(Asset.group_id == group.id).all()

        asset_entries = []
        for a in assets:
            asset_entries.append(build_asset_tree(db, a.id))

        result.append({
            "type": "group",
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "children": children,
            "assets": asset_entries
        })

    return result
"""
def get_asset_group_tree(db: Session) -> List[dict]:
    return build_group_tree(db)