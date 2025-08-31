from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
from app.constants.scopes import is_valid_scope, normalize_scope
from app.api.scopes.types import ScopeType

AssuranceStatus = Literal[
    "proposed","mapped","planning","implementing","implemented",
    "monitoring","analyzing","evidenced","fresh","expired"
]


class ControlContextLinkBase(BaseModel):
    # EITHER link to a risk context...
    risk_scenario_context_id: Optional[int] = None
    # ...OR directly to a scope
    scope_type: Optional[ScopeType] = None
    scope_id: Optional[int] = None

    control_id: int
    assurance_status: AssuranceStatus = Field(default="mapped", alias="status")
    implemented_at: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("scope_type")
    @classmethod
    def _norm_scope(cls, v):
        if v is None: return v
        return normalize_scope(v)

    @field_validator("control_id")
    @classmethod
    def _require_target(cls, v, info):
        data = info.data
        if not data.get("risk_scenario_context_id") and not (data.get("scope_type") and data.get("scope_id")):
            raise ValueError("Provide either risk_scenario_context_id or (scope_type & scope_id)")
        return v

    class Config:
        from_attributes = True
        populate_by_name = True  # allows using field name or alias


class ControlContextStatusUpdate(BaseModel):
    assurance_status: AssuranceStatus = Field(default="mapped", alias="status")
    implemented_at: Optional[datetime] = None
    notes: Optional[str] = None




class ControlContextLinkCreate(ControlContextLinkBase):
    pass

class ControlContextLinkUpdate(BaseModel):
    risk_scenario_context_id: Optional[int] = None
    scope_type: Optional[ScopeType] = None
    scope_id: Optional[int] = None
    assurance_status: Optional[AssuranceStatus] = None
    implemented_at: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class ControlContextLinkOut(BaseModel):
    id: int
    risk_scenario_context_id: Optional[int]
    scope_type: Optional[str]
    scope_id: Optional[int]
    control_id: int
    assurance_status: AssuranceStatus
    implemented_at: Optional[datetime]
    status_updated_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True
        populate_by_name = True
