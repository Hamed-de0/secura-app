from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .impact_rating import ImpactRatingRead

class RiskScenarioBase(BaseModel):
    title_en: str
    title_de: str
    description_en: Optional[str] = None
    description_de: Optional[str] = None
    likelihood: int # scale 1-5

    threat_id: int
    vulnerability_id: int
    asset_id: Optional[int] = None
    asset_group_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    lifecycle_states: Optional[List[str]] = None

    subcategory_id: int

class RiskScenarioCreate(RiskScenarioBase):
    pass

class RiskScenarioUpdate(BaseModel):
    title_en: Optional[str] = None
    title_de: Optional[str] = None
    description_en: Optional[str] = None
    description_de: Optional[str] = None
    likelihood: Optional[int] = None

    threat_id: Optional[int] = None
    vulnerability_id: Optional[int] = None
    asset_id: Optional[int] = None
    asset_group_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    lifecycle_states: Optional[List[str]] = None
    subcategory_id: Optional[int] = None

class RiskScenarioRead(RiskScenarioBase):
    id: int
    created_at: datetime
    updated_at: datetime
    enabled: bool
    impacts: List[ImpactRatingRead] = []  # auto-loaded by relationship

    class Config:
        from_attributes = True
