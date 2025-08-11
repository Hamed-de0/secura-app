from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ControlContextEffectOverrideBase(BaseModel):
    risk_scenario_context_id: int
    control_id: int
    domain_id: int
    score_override: float   # 0..1
    last_tested_at: Optional[datetime] = None

class ControlContextEffectOverrideCreate(ControlContextEffectOverrideBase):
    pass

class ControlContextEffectOverrideUpdate(BaseModel):
    score_override: Optional[float] = None
    last_tested_at: Optional[datetime] = None

class ControlContextEffectOverrideOut(ControlContextEffectOverrideBase):
    id: int
    class Config:
        from_attributes = True
