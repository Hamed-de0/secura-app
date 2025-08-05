from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.crud.risks import risk_context_impact_rating as crud
from app.schemas.risks.risk_context_impact_rating import (
    RiskContextImpactRatingCreate,
    RiskContextImpactRatingRead,
)
from typing import List

router = APIRouter(prefix="/risk-context-impact-ratings", tags=["Impact Ratings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=RiskContextImpactRatingRead)
def create_rating(rating_in: RiskContextImpactRatingCreate, db: Session = Depends(get_db)):
    return crud.upsert_rating(db, rating_in)

@router.get("/by-context/{context_id}", response_model=List[RiskContextImpactRatingRead])
def read_by_context(context_id: int, db: Session = Depends(get_db)):
    return crud.get_ratings_by_context(db, context_id)

@router.post("/batch/", response_model=List[RiskContextImpactRatingRead])
def upsert_ratings_batch(ratings: List[RiskContextImpactRatingCreate], db: Session = Depends(get_db)):
    return crud.upsert_bulk(db, ratings)
