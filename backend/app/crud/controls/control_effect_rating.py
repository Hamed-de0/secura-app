# crud/crud_control_effect_rating.py

from sqlalchemy.orm import Session
from app.models.controls.control_effect_rating import ControlEffectRating
from app.schemas.controls.control_effect_rating import ControlEffectRatingCreate, ControlEffectRatingUpdate
from typing import Optional, List

def create_control_effect_rating(db: Session, rating: ControlEffectRatingCreate):
    db_rating = ControlEffectRating(**rating.dict())
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating

def get_by_scenario(db: Session, scenario_id: int):
    return db.query(ControlEffectRating).filter(ControlEffectRating.risk_scenario_id == scenario_id).all()

def get_by_control(db: Session, control_id: int):
    return db.query(ControlEffectRating).filter(ControlEffectRating.control_id == control_id).all()

def update_rating(db: Session, rating_id: int, update: ControlEffectRatingUpdate):
    db_rating = db.query(ControlEffectRating).get(rating_id)
    if not db_rating:
        return None
    for field, value in update.dict(exclude_unset=True).items():
        setattr(db_rating, field, value)
    db.commit()
    db.refresh(db_rating)
    return db_rating

def delete_rating(db: Session, rating_id: int):
    db_rating = db.query(ControlEffectRating).get(rating_id)
    if db_rating:
        db.delete(db_rating)
        db.commit()

def upsert_control_effect_rating(db: Session, rating_in: ControlEffectRatingCreate) -> Optional[ControlEffectRating]:
    existing = db.query(ControlEffectRating).filter_by(
        risk_scenario_id=rating_in.risk_scenario_id,
        domain_id=rating_in.domain_id,
        control_id=rating_in.control_id
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

    new_rating = ControlEffectRating(**rating_in.dict())
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating

def upsert_control_effect_ratings_bulk(db: Session, ratings: List[ControlEffectRatingCreate]):
    results = []
    for rating in ratings:
        result = upsert_control_effect_rating(db, rating)
        if result:
            results.append(result)
    return results

