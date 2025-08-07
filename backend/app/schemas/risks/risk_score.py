from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel


# Shared base class (used for both tables)
class RiskScoreBase(BaseModel):
    risk_scenario_context_id: int
    initial_score: float
    residual_score: float
    initial_by_domain: Dict[str, float]
    residual_by_domain: Dict[str, float]


# -------- RiskScore (latest) --------
class RiskScoreRead(RiskScoreBase):
    last_updated: datetime

    class Config:
        from_attributes = True


# -------- RiskScoreHistory --------
class RiskScoreHistoryRead(RiskScoreBase):
    created_at: datetime

    class Config:
        from_attributes = True
