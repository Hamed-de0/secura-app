from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.crud.risks import (
    create_impact_rating,
    get_impact_ratings_for_scenario
)
from app.schemas.risks import ImpactRatingCreate, ImpactRatingRead

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
    return create_impact_rating(db, rating_in)

@router.get("/by-scenario/{scenario_id}", response_model=list[ImpactRatingRead])
def read_by_scenario(scenario_id: int, db: Session = Depends(get_db)):
    return get_impact_ratings_for_scenario(db, scenario_id)
