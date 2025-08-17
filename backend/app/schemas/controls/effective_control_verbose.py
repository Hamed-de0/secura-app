from typing import Optional, Literal, List
from pydantic import BaseModel
from app.schemas.controls.effective_control import EffectiveControlOut

class LostTo(BaseModel):
    scope_type: str
    scope_id: int
    reason: Literal["more_specific", "better_status", "source_preference"]

class EffectiveControlCandidate(BaseModel):
    control_id: int
    link_id: Optional[int] = None
    source: Literal["direct","provider","baseline"]
    assurance_status: str
    scope_type: str
    scope_id: int
    provider_service_id: Optional[int] = None
    inheritance_type: Optional[Literal["direct","conditional","advisory"]] = None
    responsibility: Optional[Literal["provider_owner","consumer_owner","shared"]] = None
    notes: Optional[str] = None
    lost_to: Optional[LostTo] = None

class EffectiveControlsVerboseOut(BaseModel):
    winners: List[EffectiveControlOut]
    candidates: List[EffectiveControlCandidate]
