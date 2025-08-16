from typing import List, Optional
from pydantic import BaseModel

class ControlHit(BaseModel):
    control_id: int
    source: str                 # direct|provider|baseline
    assurance_status: str       # fresh|evidenced|implemented|...
    inheritance_type: Optional[str] = None
    weight_share: float
    contribution: float

class RequirementImplementationCoverage(BaseModel):
    requirement_id: int
    code: str
    title: Optional[str] = None
    score: float                # 0..1
    hits: List[ControlHit]

class FrameworkImplementationCoverage(BaseModel):
    version_id: int
    scope_type: str
    scope_id: int
    score: float                # average across requirements
    requirements: List[RequirementImplementationCoverage]
