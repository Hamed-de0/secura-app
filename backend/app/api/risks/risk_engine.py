from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.risk_engine import RiskEngine
from app.schemas.risks.risk_context_impact_rating import RiskContextImpactRatingCreate

router = APIRouter(prefix="/risk-engine", tags=["Risk Engine"])

class ImpactRatingItem(BaseModel):
    domain_id: int
    score: int

class GenerateByTypeRequest(BaseModel):
    default_likelihood: int = Field(..., ge=0, le=5)
    impact_ratings: List[ImpactRatingItem] = []
    status: str = "Open"
    dry_run: bool = False
    recalc_scores: bool = True

@router.get("/preview/by-type/{asset_type_id}")
def preview_by_type(asset_type_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    return RiskEngine(db).preview_by_type(asset_type_id)

@router.post("/generate/by-type/{asset_type_id}")
def generate_by_type(asset_type_id: int, req: GenerateByTypeRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    eng = RiskEngine(db)
    return eng.upsert_type_contexts(
        asset_type_id=asset_type_id,
        default_likelihood=req.default_likelihood,
        impact_ratings=[i.dict() for i in req.impact_ratings],
        status=req.status,
        dry_run=req.dry_run,
        recalc_scores=req.recalc_scores,
    )
