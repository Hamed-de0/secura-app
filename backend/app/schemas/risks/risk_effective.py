from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class ControlsOut(BaseModel):
    implemented: int
    total: int
    recommended: List[str]
    implementedList: List[str]

class EvidenceOut(BaseModel):
    ok: int
    warn: int

class SourceOut(BaseModel):
    scope: str
    name: str
    likelihood: int
    impacts: Dict[str, int]

class RiskEffectiveItem(BaseModel):
    id: int
    scenarioId: int
    scenarioTitle: str
    assetName: str
    scope: str
    owner: str
    ownerInitials: str
    status: str
    likelihood: int
    impacts: Dict[str, int]
    initial: int
    residual: int
    trend: List[Dict[str, int]]
    controls: ControlsOut
    evidence: EvidenceOut
    lastReview: Optional[str] = None
    nextReview: Optional[str] = None
    sources: List[SourceOut]
    compliance: List[str]
