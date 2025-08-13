from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ControlApplicabilityPolicyBase(BaseModel):
    set_type: str = "baseline"
    asset_type_id: Optional[int] = None
    asset_tag_id: Optional[int] = None
    asset_group_id: Optional[int] = None
    controls_json: List[int]
    priority: int = 0
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    notes: Optional[str] = None
    model_config = ConfigDict(extra="ignore")

class ControlApplicabilityPolicyCreate(ControlApplicabilityPolicyBase): pass

class ControlApplicabilityPolicyUpdate(BaseModel):
    set_type: Optional[str] = None
    asset_type_id: Optional[int] = None
    asset_tag_id: Optional[int] = None
    asset_group_id: Optional[int] = None
    controls_json: Optional[List[int]] = None
    priority: Optional[int] = None
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    notes: Optional[str] = None

class ControlApplicabilityPolicyOut(ControlApplicabilityPolicyBase):
    id: int
