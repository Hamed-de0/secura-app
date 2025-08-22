from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Literal
from datetime import datetime

ScopeLiteral = Optional[Literal[
    "org","entity","business_unit","site",
    "asset","asset_group","asset_type","asset_tag"
]]

class RiskAppetitePolicyBase(BaseModel):
    scope: ScopeLiteral = None
    scope_id: Optional[int] = None   # must be provided when scope != None
    domain: Optional[str] = None     # 'C','I','A','L','R' or None (total)

    green_max: int
    amber_max: int

    domain_caps_json: Optional[Dict[str, int]] = None
    sla_days_amber: Optional[int] = None
    sla_days_red: Optional[int] = None

    priority: int = 0
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("scope_id")
    @classmethod
    def _require_scope_id_if_scope(cls, v, info):
        scope = info.data.get("scope")
        if scope and v is None:
            raise ValueError("scope_id is required when scope is set")
        if not scope and v is not None:
            raise ValueError("scope must be set when scope_id is provided")
        return v

class RiskAppetitePolicyCreate(RiskAppetitePolicyBase):
    pass

class RiskAppetitePolicyUpdate(BaseModel):
    scope: ScopeLiteral = None
    scope_id: Optional[int] = None
    domain: Optional[str] = None
    green_max: Optional[int] = None
    amber_max: Optional[int] = None
    domain_caps_json: Optional[Dict[str, int]] = None
    sla_days_amber: Optional[int] = None
    sla_days_red: Optional[int] = None
    priority: Optional[int] = None
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    notes: Optional[str] = None

class RiskAppetitePolicyOut(RiskAppetitePolicyBase):
    id: int
    class Config:
        from_attributes = True
