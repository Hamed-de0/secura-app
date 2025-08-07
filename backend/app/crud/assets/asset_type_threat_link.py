from sqlalchemy.orm import Session
from app.models.assets.asset_type_control_link import AssetTypeControlLink
from app.schemas.assets.asset_type_control_link import AssetTypeControlLinkCreate

def create_link(db: Session, link: AssetTypeControlLinkCreate):
    db_link = AssetTypeControlLink(**link.dict())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

def get_links_by_asset_type(db: Session, asset_type_id: int):
    return db.query(AssetTypeControlLink).filter_by(asset_type_id=asset_type_id).all()

def delete_link(db: Session, link_id: int):
    db.query(AssetTypeControlLink).filter_by(id=link_id).delete()
    db.commit()
