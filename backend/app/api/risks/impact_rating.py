from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.crud.risks import (
    upsert_impact_rating,
    get_impact_ratings_for_scenario,
    upsert_impact_ratings_bulk
)
from app.schemas.risks import ImpactRatingCreate, ImpactRatingRead
from typing import List

router = APIRouter(prefix="/impact-ratings", tags=["Impact Ratings"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ImpactRatingRead)
def create(rating_in: ImpactRatingCreate, db: Session = Depends(get_db)):
    return upsert_impact_rating(db, rating_in)

@router.get("/by-scenario/{scenario_id}", response_model=list[ImpactRatingRead])
def read_by_scenario(scenario_id: int, db: Session = Depends(get_db)):
    return get_impact_ratings_for_scenario(db, scenario_id)

@router.post("/batch/", response_model=List[ImpactRatingRead])
def upsert_ratings_batch(
    ratings: List[ImpactRatingCreate],
    db: Session = Depends(get_db)
):
    return upsert_impact_ratings_bulk(db, ratings)