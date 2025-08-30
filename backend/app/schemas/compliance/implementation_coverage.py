from typing import List, Optional, Literal
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
    # NEW:
    status: Literal["met", "partial", "gap", "unknown"]
    exception_applied: bool = False
    exception_id: Optional[int] = None

class FrameworkImplementationCoverage(BaseModel):
    version_id: int
    scope_type: str
    scope_id: int
    score: float                # average across requirements
    requirements: List[RequirementImplementationCoverage]
