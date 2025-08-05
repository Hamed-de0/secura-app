from pydantic import BaseModel

class RiskLevelBreakdown(BaseModel):
    high: int
    medium: int
    low: int

class DashboardSummary(BaseModel):
    assets: int
    threats: int
    risks: int
    controls: int
    risk_levels: RiskLevelBreakdown
