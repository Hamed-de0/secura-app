from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel

ScopeType = Literal["org", "asset_group", "asset_type", "tag", "asset"]

class ActiveFrameworkVersion(BaseModel):
    policy_id: int
    priority: int
    framework_id: int
    framework_name: str
    version_id: int
    version_label: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active_now: bool
    source_scope_type: str
    source_scope_id: int

class ActiveFrameworksResponse(BaseModel):
    scope_type: str
    scope_id: int
    items: List[ActiveFrameworkVersion]

class FrameworkActivationPolicyCreate(BaseModel):
    framework_version_id: int
    scope_type: ScopeType
    scope_id: int
    priority: int = 0
    is_enabled: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    notes: Optional[str] = None

class FrameworkActivationPolicyRead(BaseModel):
    id: int
    framework_version_id: int
    scope_type: str
    scope_id: int
    priority: int
    is_enabled: bool
    start_date: datetime
    end_date: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # pydantic v2 (use orm_mode=True on v1)
