from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Asset, Threat, RiskScenario, Control, RiskScore
from app.schemas.dashboards.main_dashboard import DashboardSummary, RiskLevelBreakdown

def classify_risk_level(score: float) -> str:
    if score >= 12:
        return "High"
    elif score >= 6:
        return "Medium"
    else:
        return "Low"


def get_dashboard_summary(db: Session) -> DashboardSummary:
    asset_count = db.query(func.count(Asset.id)).scalar()
    threat_count = db.query(func.count(Threat.id)).scalar()
    risk_count = db.query(func.count(RiskScenario.id)).scalar()
    control_count = db.query(func.count(Control.id)).scalar()

    score_entries = db.query(RiskScore.residual_score).all()
    level_counts = {"High": 0, "Medium": 0, "Low": 0}

    for (score,) in score_entries:
        level = classify_risk_level(score or 0)
        level_counts[level] += 1

    risk_levels = RiskLevelBreakdown(
        high=level_counts["High"],
        medium=level_counts["Medium"],
        low=level_counts["Low"]
    )

    return DashboardSummary(
        assets=asset_count,
        threats=threat_count,
        risks=risk_count,
        controls=control_count,
        risk_levels=risk_levels
    )
