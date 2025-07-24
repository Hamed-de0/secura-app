from sqlalchemy.orm import Session
from app.models.risks.impact_rating import ImpactRating
from app.schemas.risks import ImpactRatingCreate
from typing import List, Optional

def create_impact_rating(db: Session, rating_in: ImpactRatingCreate) -> ImpactRating:
    rating = ImpactRating(**rating_in.dict())
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating

def get_impact_ratings_for_scenario(db: Session, scenario_id: int) -> List[ImpactRating]:
    return db.query(ImpactRating).filter(ImpactRating.scenario_id == scenario_id).all()
