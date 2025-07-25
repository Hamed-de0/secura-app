from sqlalchemy.orm import Session
from app.models.controls.control_asset_link import ControlAssetLink
from app.schemas.controls.control_asset_link import ControlAssetLinkCreate

def create_control_asset_link(db: Session, link: ControlAssetLinkCreate):
    db_link = ControlAssetLink(**link.model_dump())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

def delete_control_asset_link(db: Session, control_id: int, asset_id: int):
    db_link = db.query(ControlAssetLink).filter_by(
        control_id=control_id, asset_id=asset_id
    ).first()
    if db_link:
        db.delete(db_link)
        db.commit()
        return True
    return False
