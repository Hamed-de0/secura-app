from sqlalchemy.orm import Session
from app.models.assets.asset_type_control_link import AssetTypeControlLink
from app.schemas.assets.asset_type_control_link import AssetTypeControlLinkCreate
from app.models.controls.control import Control

def create_link(db: Session, asset_type_id: int, control_id: int, score: float =None, justification: str =None):
    # upsert-like: ignore if exists
    existing = db.query(AssetTypeControlLink).filter_by(
        asset_type_id=asset_type_id, control_id=control_id
    ).first()
    if existing:
        if score is not None:
            existing.score = score
        if justification is not None:
            existing.justification = justification
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    link = AssetTypeControlLink(
        asset_type_id=asset_type_id,
        control_id=control_id,
        score=score,
        justification=justification,
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link

def get_links_by_asset_type(db: Session, asset_type_id: int):
    return db.query(AssetTypeControlLink).filter_by(asset_type_id=asset_type_id).all()

def delete_link(db: Session, link_id: int):
    db.query(AssetTypeControlLink).filter_by(id=link_id).delete()
    db.commit()

def get_links_by_asset_type_details(db: Session, asset_type_id: int):
    results = (
        db.query(
            AssetTypeControlLink.id,
            AssetTypeControlLink.control_id,
            AssetTypeControlLink.asset_type_id,
            AssetTypeControlLink.score,
            AssetTypeControlLink.justification,
            Control.reference_code,
            Control.title_en,
            Control.category,
            Control.control_source,
            Control.description_en,
        )
        .join(Control, Control.id == AssetTypeControlLink.control_id)
        .filter(AssetTypeControlLink.asset_type_id == asset_type_id)
        .order_by(Control.reference_code)
        .all()
    )
    return results



