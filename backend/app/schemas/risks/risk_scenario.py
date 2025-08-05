from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .risk_context_impact_rating import RiskContextImpactRatingRead

class RiskScenarioBase(BaseModel):
    title_en: str
    title_de: str
    description_en: Optional[str] = None
    description_de: Optional[str] = None
    likelihood: int # scale 1-5
    status: Optional[str] = None  # E.g., 'Open', 'Mitigated', 'Accepted'

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
    status: Optional[str] = None  # E.g., 'Open', 'Mitigated', 'Accepted'


class RiskScenarioRead(RiskScenarioBase):
    id: int
    threat_name: Optional[str] = None
    vulnerability_name: Optional[str] = None
    asset_name: Optional[str] = None
    asset_group_name: Optional[str] = None
    tag_names: Optional[List[str]] = []
    subcategory_name_en: Optional[str] = None
    subcategory_name_de: Optional[str] = None
    category_name_en: Optional[str] = None
    category_name_de: Optional[str] = None
    status: Optional[str] = None  # E.g., 'Open', 'Mitigated', 'Accepted'

    created_at: datetime
    updated_at: datetime
    enabled: bool
    impacts: List[RiskContextImpactRatingRead] = []  # auto-loaded by relationship

    class Config:
        from_attributes = True

class RiskScenarioBrief(BaseModel):
    id: int
    title_en: str
    likelihood: int
    lifecycle_states: Optional[List[str]]
    threat_id: Optional[int]
    threat_name: Optional[str]
    vulnerability_id: Optional[int]
    vulnerability_name: Optional[str]
    asset_id: Optional[int]
    asset_name: Optional[str]
    status: Optional[str]

    class Config:
        from_attributes = True

class RiskScenarioSubcategoryGrouped(BaseModel):
    subcategory_id: int
    subcategory_name_de: str
    subcategory_name_en: str
    scenarios: List[RiskScenarioBrief]

class RiskScenarioGrouped(BaseModel):
    category_id: int
    category_name_de: str
    category_name_en: str
    subcategories: List[RiskScenarioSubcategoryGrouped]


class RiskScenarioEnrichRequest(BaseModel):
    threat_id: Optional[str] = None
    vulnerability_id: Optional[str] = None
    controls: Optional[List[str]] = []

