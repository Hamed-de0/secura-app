from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .impact_rating import ImpactRatingRead

class RiskScenarioBase(BaseModel):
    asset_id: int
    threat_id: int
    vulnerability_id: int
    title_en: str
    title_de: str
    description_en: Optional[str] = None
    description_de: Optional[str] = None
    likelihood: int  # 1–5 scale

class RiskScenarioCreate(RiskScenarioBase):
    pass

class RiskScenarioUpdate(BaseModel):
    asset_id: Optional[int] = None
    threat_id: Optional[int] = None
    vulnerability_id: Optional[int] = None
    title_en: Optional[str] = None
    title_de: Optional[str] = None
    description_en: Optional[str] = None
    description_de: Optional[str] = None
    likelihood: Optional[int] = None

class RiskScenarioRead(RiskScenarioBase):
    id: int
    created_at: datetime
    updated_at: datetime
    enabled: bool
    impacts: List[ImpactRatingRead] = []  # auto-loaded by relationship

    class Config:
        from_attributes = True
