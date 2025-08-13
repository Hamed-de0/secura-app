from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class RiskAppetitePolicyBase(BaseModel):
    asset_type_id: Optional[int] = None
    asset_tag_id: Optional[int] = None
    asset_group_id: Optional[int] = None
    domain: Optional[str] = None
    green_max: int
    amber_max: int
    domain_caps_json: Optional[Dict[str, int]] = None
    sla_days_amber: Optional[int] = None
    sla_days_red: Optional[int] = None
    priority: int = 0
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    notes: Optional[str] = None

class RiskAppetitePolicyCreate(RiskAppetitePolicyBase): pass
class RiskAppetitePolicyUpdate(BaseModel):  # partial update
    asset_type_id: Optional[int] = None
    asset_tag_id: Optional[int] = None
    asset_group_id: Optional[int] = None
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
    class Config: from_attributes = True
