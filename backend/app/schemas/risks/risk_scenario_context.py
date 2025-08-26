from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from app.constants.scopes import is_valid_scope, normalize_scope

class RiskScenarioContextBase(BaseModel):
    risk_scenario_id: int

    # NEW normalized scope
    scope_type: Literal["asset","tag","asset_group","asset_type","bu","site","entity","service","org_group"]
    scope_id: int

    # Legacy (deprecated) fields — keep optional for a while
    asset_id: Optional[int] = None
    asset_group_id: Optional[int] = None
    asset_tag_id: Optional[int] = None
    asset_type_id: Optional[int] = None  # <-- fix typo here

    owner_id: Optional[int] = None

    lifecycle_states: Optional[List[str]] = None
    status: Optional[str] = "Open"
    threat_id: Optional[int] = None
    vulnerability_id: Optional[int] = None
    likelihood: Optional[int] = None

    @model_validator(mode="after")
    def _normalize(self):
        # accept legacy fields and infer scope if scope_type/id not explicitly provided
        if not self.scope_type or not self.scope_id:
            if self.asset_id:        self.scope_type, self.scope_id = "asset", self.asset_id
            elif self.asset_group_id:self.scope_type, self.scope_id = "asset_group", self.asset_group_id
            elif self.asset_tag_id:  self.scope_type, self.scope_id = "tag", self.asset_tag_id
            elif self.asset_type_id: self.scope_type, self.scope_id = "asset_type", self.asset_type_id
        self.scope_type = normalize_scope(self.scope_type)
        return self



class RiskScenarioContextCreate(RiskScenarioContextBase):
    pass

class RiskScenarioContextUpdate(RiskScenarioContextBase):
    risk_scenario_id: Optional[int] = None

    scope_type: Optional[Literal[
        "asset", "tag", "asset_group", "asset_type", "bu", "site", "entity", "service", "org_group"
    ]] = None
    scope_id: Optional[int] = None

    owner_id: Optional[int] = None

    lifecycle_states: Optional[List[str]] = None
    status: Optional[str] = None
    threat_id: Optional[int] = None
    vulnerability_id: Optional[int] = None
    likelihood: Optional[int] = None

    class Config:
        extra = "ignore"  # ignore unexpected keys from the client

class RiskScenarioContextInDBBase(RiskScenarioContextBase):
    id: int
    created_at: datetime
    updated_at: datetime
    enabled: bool

    class Config:
        from_attributes = True

class RiskScenarioContext(RiskScenarioContextInDBBase):
    id: int
    risk_scenario_id: int
    scope_type: str
    scope_id: int
    status: str
    likelihood: Optional[int]
    lifecycle_states: Optional[List[str]] = None

    class Config:
        from_attributes = True

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


