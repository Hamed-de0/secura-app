from pydantic import BaseModel
from typing import Optional


class ControlRiskLinkBase(BaseModel):
    control_id: int
    risk_scenario_id: int
    status: Optional[str] = "Planned"  # e.g., Planned, In Place, Ineffective
    justification: Optional[str] = None
    residual_score: Optional[int] = None  # 0–5 scale
    effect_type: Optional[str] = None


class ControlRiskLinkCreate(ControlRiskLinkBase):
    pass


class ControlRiskLinkUpdate(BaseModel):
    status: Optional[str] = None
    justification: Optional[str] = None
    residual_score: Optional[int] = None
    effect_type: Optional[str] = None


class ControlRiskLinkRead(ControlRiskLinkBase):
    id: int

    class Config:
        from_attributes = True
