# api/api_control_effect_rating.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud.controls import control_effect_rating as crud
from app.schemas.controls.control_effect_rating import *
from typing import List
from app.models.controls.control_effect_rating import ControlEffectRating
import pandas as pd
import os

router = APIRouter(prefix="/control-effect-ratings", tags=["Control Effect Rating"])

@router.post("/", response_model=List[ControlEffectRatingOut])
def create_rating(payload: List[ControlEffectRatingCreate], db: Session = Depends(get_db)):
    return crud.upsert_control_effect_ratings_bulk(db, payload)

@router.get("/by-scenario/{scenario_id}", response_model=list[ControlEffectRatingOut])
def get_by_scenario(scenario_id: int, db: Session = Depends(get_db)):
    return crud.get_by_scenario(db, scenario_id)

@router.get("/by-control/{control_id}", response_model=list[ControlEffectRatingOut])
def get_by_control(control_id: int, db: Session = Depends(get_db)):
    return crud.get_by_control(db, control_id)

@router.post("/bulk_insert")
def update(rating_id: int, payload: ControlEffectRatingUpdate, db: Session = Depends(get_db)):
    csv_path = os.path.join("app", "data", "control_effect_rating_filled.csv")

    print(os.getcwd(), csv_path)
    df = pd.read_csv(csv_path)

    # Convert rows
    records = [
        ControlEffectRating(
            risk_scenario_id=int(row["risk_scenario_id"]),
            control_id=int(row["control_id"]),
            domain_id=int(row["domain_id"]),
            score=int(row["score"])
        )
        for _, row in df.iterrows()
    ]

    # Insert in bulk
    db.bulk_save_objects(records)
    db.commit()
    db.close()

    # print("✅ Inserted into database.")
    return {"message", "inserted"}

@router.delete("/{rating_id}")
def delete(rating_id: int, db: Session = Depends(get_db)):
    crud.delete_rating(db, rating_id)
    return {"ok": True}
