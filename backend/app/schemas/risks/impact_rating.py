from pydantic import BaseModel
from datetime import datetime

class ImpactRatingBase(BaseModel):
    scenario_id: int
    domain_id: int
    score: int  # Scale: 1–5, 1–10, etc.

class ImpactRatingCreate(ImpactRatingBase):
    pass

class ImpactRatingRead(ImpactRatingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
