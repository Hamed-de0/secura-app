from typing import Optional, List
from pydantic import BaseModel

class RiskScenarioContextBase(BaseModel):
    risk_scenario_id: int
    asset_id: Optional[int] = None
    asset_group_id: Optional[int] = None
    asset_tag_id: Optional[int] = None
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
