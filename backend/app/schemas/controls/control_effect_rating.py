# schemas/control_effect_rating.py

from pydantic import BaseModel
from typing import Optional

class ControlEffectRatingBase(BaseModel):
    risk_scenario_id: int
    control_id: int
    domain_id: int
    score: int

class ControlEffectRatingCreate(ControlEffectRatingBase):
    pass

class ControlEffectRatingUpdate(BaseModel):
    score: Optional[int] = None

class ControlEffectRatingOut(ControlEffectRatingBase):
    id: int

    class Config:
        orm_mode = True
