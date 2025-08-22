from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Literal
from datetime import datetime

class SlaDaysOut(BaseModel):
    amber: Optional[int] = None
    red: Optional[int] = None

class AppetiteOut(BaseModel):
    greenMax: int
    amberMax: int
    domainCaps: Dict[str, int] = {}
    slaDays: SlaDaysOut

    class Config:
        # tolerate extras like "_policy_id" if you include it in the resolver
        extra = "ignore"

class ControlsOut(BaseModel):
    implemented: int
    total: int
    recommended: List[str]
    implementedList: List[str]
    coverage: Optional[float]

class EvidenceOut(BaseModel):
    ok: int
    warn: int
    overdue: Optional[int]

class SourceOut(BaseModel):
    scope: str
    name: str
    likelihood: int
    impacts: Dict[str, int]

class ScopeRef(BaseModel):
    type: Optional[str] = None
    id: Optional[int] = None
    label: Optional[str] = None


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

    last_update: Optional[datetime] = None
    overAppetite: Optional[bool] = None
    severity: Optional[int] = None
    severityBand: Optional[Literal["Low", "Medium", "High", "Critical"]] = None
    domains: Optional[List[Literal["C", "I", "A", "L", "R"]]] = None
    scopeDisplay: Optional[str] = None
    scopeRef: Optional[ScopeRef] = None
    reviewSLAStatus: Optional[Literal["OnTrack", "DueSoon", "Overdue"]] = None

    sources: List[SourceOut]
    compliance: List[str]
    appetite: AppetiteOut
    rag: Literal["Green", "Amber", "Red"]
