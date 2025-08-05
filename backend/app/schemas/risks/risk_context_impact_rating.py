from pydantic import BaseModel
from datetime import datetime

class RiskContextImpactRatingBase(BaseModel):
    risk_scenario_context_id: int
    domain_id: int
    score: int

class RiskContextImpactRatingCreate(RiskContextImpactRatingBase):
    pass

class RiskContextImpactRatingRead(RiskContextImpactRatingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
