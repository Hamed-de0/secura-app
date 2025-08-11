from typing import Optional, List, Literal
from pydantic import BaseModel

class RiskScenarioContextBase(BaseModel):
    risk_scenario_id: int
    asset_id: Optional[int] = None
    asset_group_id: Optional[int] = None
    asset_tag_id: Optional[int] = None
    asse_type_id: Optional[int] = None
    lifecycle_states: Optional[List[str]] = None
    status: Optional[str] = "Open"
    threat_id: Optional[int] = None
    vulnerability_id: Optional[int] = None
    likelihood: Optional[int] = None

class RiskScenarioContextCreate(RiskScenarioContextBase):
    pass

class RiskScenarioContextUpdate(RiskScenarioContextBase):
    pass

class RiskScenarioContextInDBBase(RiskScenarioContextBase):
    id: int

    class Config:
        from_attributes = True

class RiskScenarioContext(RiskScenarioContextInDBBase):
    pass

class ImpactRatingInput(BaseModel):
    domain_id: int
    score: int

class RiskContextBatchAssignInput(BaseModel):
    risk_scenario_id: int
    scope_type: Literal["asset", "group", "tag", "type"]
    target_ids: List[int]
    likelihood: int
    status: str
    lifecycle_states: List[str] = []
    impact_ratings: List[ImpactRatingInput]

