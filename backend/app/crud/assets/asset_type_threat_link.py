from sqlalchemy.orm import Session
from app.models.assets.asset_type_threat_link import AssetTypeThreatLink
from app.models.risks import Threat

from app.schemas.assets.asset_type_threat_link import AssetTypeThreatLinkCreate, AssetTypeThreatLinkOutDetails
from typing import List

def create_link(db: Session, link: AssetTypeThreatLinkCreate):
    db_link = AssetTypeThreatLink(**link.dict())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

def get_links_by_asset_type(db: Session, asset_type_id: int):
    return db.query(AssetTypeThreatLink).filter_by(asset_type_id=asset_type_id).all()

def get_links_by_asset_type_details(db: Session, asset_type_id: int):
    results = (
        db.query(
            AssetTypeThreatLink.id,
            AssetTypeThreatLink.threat_id,
            AssetTypeThreatLink.asset_type_id,
            AssetTypeThreatLink.score,
            AssetTypeThreatLink.justification,
            Threat.reference_code,
            Threat.name,
            Threat.category,
            Threat.source,
            Threat.description,
        )
        .join(Threat, Threat.id == AssetTypeThreatLink.threat_id)
        .filter(AssetTypeThreatLink.asset_type_id == asset_type_id)
        .all()
    )
    return results


def delete_link(db: Session, link_id: int):
    db.query(AssetTypeThreatLink).filter_by(id=link_id).delete()
    db.commit()
