# app/api/ai.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.assets.asset_type import AssetType
from app.models.risks.threat import Threat
from app.services.ai_matcher import suggest_threats_for_asset_type

router = APIRouter(prefix="/ai/suggest", tags=["AI Suggestion"])

@router.get("/assettype-threats/{asset_type_id}")
def suggest_threats(asset_type_id: int, db: Session = Depends(get_db)):
    asset_type = db.query(AssetType).filter(AssetType.id == asset_type_id).first()
    if not asset_type:
        raise HTTPException(status_code=404, detail="Asset type not found")

    threats = db.query(Threat).all()
    threat_list = [{"id": t.id, "category": t.category, "name": t.name, "description": t.description or ""} for t in threats]

    result = suggest_threats_for_asset_type(
        asset_type={"name": asset_type.name, "category": asset_type.category, "description": asset_type.description or "", "id": asset_type.id},
        threats=threat_list
    )

    return result
