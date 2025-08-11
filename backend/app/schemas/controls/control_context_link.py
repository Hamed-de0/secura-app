from pydantic import BaseModel, AnyUrl
from typing import Optional
from datetime import datetime

class ControlContextLinkBase(BaseModel):
    risk_scenario_context_id: int
    control_id: int
    status: Optional[str] = "proposed"
    implemented_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    evidence_url: Optional[str] = None  # keep string; AnyUrl if you prefer strict
    evidence_note: Optional[str] = None

class ControlContextLinkCreate(ControlContextLinkBase):
    pass

class ControlContextLinkUpdate(BaseModel):
    status: Optional[str] = None
    implemented_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    evidence_url: Optional[str] = None
    evidence_note: Optional[str] = None

class ControlContextLinkOut(ControlContextLinkBase):
    id: int
    class Config:
        from_attributes = True
