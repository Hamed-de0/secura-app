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


def upsert_impact_rating(db: Session, rating_in: ImpactRatingCreate) -> Optional[ImpactRating]:
    existing = db.query(ImpactRating).filter_by(
        scenario_id=rating_in.scenario_id,
        domain_id=rating_in.domain_id
    ).first()

    if rating_in.score == 0:
        # Delete if exists
        if existing:
            db.delete(existing)
            db.commit()
        return None  # Or return { "status": "deleted" } if you prefer

    if existing:
        existing.score = rating_in.score
        db.commit()
        db.refresh(existing)
        return existing

    new_rating = ImpactRating(**rating_in.dict())
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating

def upsert_impact_ratings_bulk(db: Session, ratings: List[ImpactRatingCreate]):
    results = []
    for rating in ratings:
        result = upsert_impact_rating(db, rating)
        if result:
            results.append(result)
    return results


def get_impact_ratings_for_scenario(db: Session, scenario_id: int) -> List[ImpactRating]:
    return db.query(ImpactRating).filter(ImpactRating.scenario_id == scenario_id).all()
