from sqlalchemy.orm import Session
from app.models.risks.risk_context_impact_rating import RiskContextImpactRating
from app.schemas.risks.risk_context_impact_rating import RiskContextImpactRatingCreate
from typing import List, Optional

def upsert_rating(db: Session, rating_in: RiskContextImpactRatingCreate) -> Optional[RiskContextImpactRating]:
    existing = db.query(RiskContextImpactRating).filter_by(
        risk_scenario_context_id=rating_in.risk_scenario_context_id,
        domain_id=rating_in.domain_id
    ).first()

    if rating_in.score == 0:
        if existing:
            db.delete(existing)
            db.commit()
        return None

    if existing:
        existing.score = rating_in.score
        db.commit()
        db.refresh(existing)
        return existing

    new_rating = RiskContextImpactRating(**rating_in.dict())
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating

def upsert_bulk(db: Session, ratings: List[RiskContextImpactRatingCreate]):
    return [upsert_rating(db, r) for r in ratings if r is not None]

def get_ratings_by_context(db: Session, context_id: int) -> List[RiskContextImpactRating]:
    return db.query(RiskContextImpactRating).filter(RiskContextImpactRating.risk_scenario_context_id == context_id).all()
