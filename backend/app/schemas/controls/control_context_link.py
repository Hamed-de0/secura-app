from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

AssuranceStatus = Literal[
    "proposed","mapped","planning","implementing","implemented",
    "monitoring","analyzing","evidenced","fresh","expired"
]


class ControlContextLinkBase(BaseModel):
    risk_scenario_context_id: int
    control_id: int

    # Accept both `assurance_status` and legacy `status` in requests
    assurance_status: AssuranceStatus = Field(default="mapped", alias="status")

    implemented_at: Optional[datetime] = None
    notes: Optional[str] = None

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
    # make all fields optional for PATCH/PUT
    risk_scenario_context_id: Optional[int] = None
    control_id: Optional[int] = None
    assurance_status: Optional[AssuranceStatus] = Field(default=None, alias="status")
    implemented_at: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class ControlContextLinkOut(BaseModel):
    id: int
    risk_scenario_context_id: int
    control_id: int
    assurance_status: AssuranceStatus
    implemented_at: Optional[datetime]
    status_updated_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True
