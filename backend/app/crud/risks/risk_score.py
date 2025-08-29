from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import NoResultFound
from datetime import datetime, timedelta
from typing import List
import statistics
from app.models.risks.risk_score import RiskScore, RiskScoreHistory
from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.schemas.risks.risk_score import RiskScoreRead, RiskScoreHistoryRead

from app.services import calculate_risk_scores_by_context  # assuming you have logic separated


def get_latest_score_by_context(db: Session, context_id: int) -> RiskScoreRead:
    score = db.query(RiskScore).filter(RiskScore.risk_scenario_context_id == context_id).first()
    return score


def get_score_history_by_context(db: Session, context_id: int) -> List[RiskScoreHistoryRead]:
    return db.query(RiskScoreHistory)\
             .filter(RiskScoreHistory.risk_scenario_context_id == context_id)\
             .order_by(RiskScoreHistory.created_at.desc())\
             .all()


def get_score_history_by_context_window(db: Session, context_id: int, *, days: int = 90) -> List[RiskScoreHistory]:
    """Read-only helper to fetch RiskScoreHistory within a time window (days)."""
    try:
        cutoff = datetime.utcnow() if days is None else (datetime.utcnow() - timedelta(days=max(1, int(days))))
    except Exception:
        cutoff = datetime.utcnow()
    q = (
        db.query(RiskScoreHistory)
          .filter(RiskScoreHistory.risk_scenario_context_id == context_id)
          .filter(RiskScoreHistory.created_at >= cutoff)
          .order_by(RiskScoreHistory.created_at.desc())
    )
    return q.all()


def calculate_and_store_scores(db: Session, context_id: int) -> RiskScore:
    # Calculate using shared logic
    result = calculate_risk_scores_by_context(db, context_id)

    # Update latest score (upsert)
    existing = db.query(RiskScore).filter(RiskScore.risk_scenario_context_id == context_id).first()
    if not existing:
        existing = RiskScore(risk_scenario_context_id=context_id)
        db.add(existing)

    existing.initial_score = result["initial_score"]
    existing.residual_score = result["residual_score"]
    existing.initial_by_domain = result["initial_by_domain"]
    existing.residual_by_domain = result["residual_by_domain"]
    existing.last_updated = datetime.utcnow()

    # Insert into history
    history = RiskScoreHistory(
        risk_scenario_context_id=context_id,
        initial_score=result["initial_score"],
        residual_score=result["residual_score"],
        initial_by_domain=result["initial_by_domain"],
        residual_by_domain=result["residual_by_domain"],
        created_at=datetime.utcnow()
    )
    db.add(history)

    db.commit()
    db.refresh(existing)
    return existing


def get_latest_scores_by_scenario(db: Session, scenario_id: int) -> RiskScore:
    context_ids = db.query(RiskScenarioContext.id).filter(
        RiskScenarioContext.risk_scenario_id == scenario_id
    ).all()

    context_ids = [c.id for c in context_ids]

    if not context_ids:
        return None

    scores = db.query(RiskScore).filter(
        RiskScore.risk_scenario_context_id.in_(context_ids)
    ).all()

    if not scores:
        return None

    # Aggregate: average or max
    initial_scores = [s.initial_score for s in scores]
    residual_scores = [s.residual_score for s in scores]

    # For by-domain aggregation (optional — average shown here)
    domain_ids = set()
    for s in scores:
        domain_ids.update(s.initial_by_domain.keys())

    initial_by_domain = {}
    residual_by_domain = {}
    for d in domain_ids:
        i_sum, r_sum, count = 0, 0, 0
        for s in scores:
            if d in s.initial_by_domain:
                i_sum += s.initial_by_domain[d]
                r_sum += s.residual_by_domain.get(d, 0)
                count += 1
        initial_by_domain[d] = round(i_sum / count, 2) if count else 0
        residual_by_domain[d] = round(r_sum / count, 2) if count else 0

    # Return in RiskScore-style format
    return RiskScore(
        risk_scenario_context_id=len(scores),  # placeholder (not real)
        initial_score=round(sum(initial_scores) / len(initial_scores), 2),
        residual_score=round(sum(residual_scores) / len(residual_scores), 2),
        initial_by_domain=initial_by_domain,
        residual_by_domain=residual_by_domain,
        last_updated=max([s.last_updated for s in scores])
    )



def get_score_history_by_scenario(db: Session, scenario_id: int) -> List[RiskScoreHistory]:
    context_ids = db.query(RiskScenarioContext.id).filter(
        RiskScenarioContext.risk_scenario_id == scenario_id
    ).all()

    context_ids = [c.id for c in context_ids]

    return db.query(RiskScoreHistory).filter(
        RiskScoreHistory.risk_scenario_context_id.in_(context_ids)
    ).order_by(RiskScoreHistory.created_at.desc()).all()


def calculate_scores_by_scenario(db: Session, scenario_id: int) -> List[RiskScore]:
    context_ids = db.query(RiskScenarioContext.id).filter(
        RiskScenarioContext.risk_scenario_id == scenario_id
    ).all()

    updated_scores = []
    for c in context_ids:
        score = calculate_and_store_scores(db, c.id)
        updated_scores.append(score)
    return updated_scores


def calculate_all_scores(db: Session) -> List[RiskScore]:
    all_contexts = db.query(RiskScenarioContext.id).all()
    updated_scores = []

    for c in all_contexts:
        score = calculate_and_store_scores(db, c.id)
        updated_scores.append(score)
    return updated_scores
