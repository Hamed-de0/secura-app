from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Asset, Threat, RiskScenario, Control
from app.schemas.dashboards.main_dashboard import DashboardSummary, RiskLevelBreakdown

def get_dashboard_summary(db: Session) -> DashboardSummary:
    asset_count = db.query(func.count(Asset.id)).scalar()
    threat_count = db.query(func.count(Threat.id)).scalar()
    risk_count = db.query(func.count(RiskScenario.id)).scalar()
    control_count = db.query(func.count(Control.id)).scalar()

    risk_levels = RiskLevelBreakdown(
        high=db.query(func.count(RiskScenario.id)).filter(RiskScenario.risk_level == "High").scalar(),
        medium=db.query(func.count(RiskScenario.id)).filter(RiskScenario.risk_level == "Medium").scalar(),
        low=db.query(func.count(RiskScenario.id)).filter(RiskScenario.risk_level == "Low").scalar(),
    )

    return DashboardSummary(
        assets=asset_count,
        threats=threat_count,
        risks=risk_count,
        controls=control_count,
        risk_levels=risk_levels
    )
