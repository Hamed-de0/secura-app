from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class FrameworkActivationPolicyBase(BaseModel):
    framework_id: int
    asset_type_id: Optional[int] = None
    asset_tag_id: Optional[int] = None
    asset_group_id: Optional[int] = None
    priority: int = 0
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    notes: Optional[str] = None
    model_config = ConfigDict(extra="ignore")

class FrameworkActivationPolicyCreate(FrameworkActivationPolicyBase): pass
class FrameworkActivationPolicyUpdate(BaseModel):
    framework_id: Optional[int] = None
    asset_type_id: Optional[int] = None
    asset_tag_id: Optional[int] = None
    asset_group_id: Optional[int] = None
    priority: Optional[int] = None
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    notes: Optional[str] = None

class FrameworkActivationPolicyOut(FrameworkActivationPolicyBase):
    id: int
