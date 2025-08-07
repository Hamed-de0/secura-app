from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.risks.risk_score import RiskScoreRead, RiskScoreHistoryRead
from app.crud.risks import risk_score as crud
from app.database import get_db

router = APIRouter(prefix="/risk-scores", tags=["Risk Scores"])


# ------- CONTEXT -------
@router.get("/context/{context_id}", response_model=RiskScoreRead)
def get_context_score(context_id: int, db: Session = Depends(get_db)):
    score = crud.get_latest_score_by_context(db, context_id)
    if not score:
        raise HTTPException(status_code=404, detail="No score found for context")
    return score


@router.get("/context/history/{context_id}", response_model=list[RiskScoreHistoryRead])
def get_context_history(context_id: int, db: Session = Depends(get_db)):
    return crud.get_score_history_by_context(db, context_id)


@router.get("/context/calculate/{context_id}", response_model=RiskScoreRead)
def calculate_context_score(context_id: int, db: Session = Depends(get_db)):
    return crud.calculate_and_store_scores(db, context_id)


# ------- SCENARIO -------
@router.get("/scenario/{scenario_id}", response_model=RiskScoreRead)
def get_scores_by_scenario(scenario_id: int, db: Session = Depends(get_db)):
    return crud.get_latest_scores_by_scenario(db, scenario_id)


@router.get("/scenario/history/{scenario_id}", response_model=list[RiskScoreHistoryRead])
def get_score_history_by_scenario(scenario_id: int, db: Session = Depends(get_db)):
    return crud.get_score_history_by_scenario(db, scenario_id)


@router.get("/scenario/calculate/{scenario_id}", response_model=list[RiskScoreRead])
def calculate_scores_by_scenario(scenario_id: int, db: Session = Depends(get_db)):
    return crud.calculate_scores_by_scenario(db, scenario_id)


# ------- SYSTEM-WIDE -------
@router.get("/calculate", response_model=list[RiskScoreRead])
def calculate_all_scores(db: Session = Depends(get_db)):
    return crud.calculate_all_scores(db)
