from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .impact_rating import ImpactRatingRead

class RiskScenarioBase(BaseModel):
    asset_id: int
    threat_id: int
    vulnerability_id: int
    likelihood: int
    description: Optional[str] = None

class RiskScenarioCreate(RiskScenarioBase):
    pass

class RiskScenarioRead(RiskScenarioBase):
    id: int
    created_at: datetime
    updated_at: datetime
    impacts: List[ImpactRatingRead] = []  # auto-loaded by relationship

    class Config:
        from_attributes = True
