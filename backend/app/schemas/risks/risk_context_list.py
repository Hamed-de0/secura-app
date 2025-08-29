from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
from datetime import datetime

# ---------- submodels ----------

class ControlsOut(BaseModel):
    implemented: int
    total: int
    recommended: List[str]
    implementedList: List[str]
    # NEW: 0..1 (UI can render as %)
    coverage: Optional[float] = None

class EvidenceOut(BaseModel):
    ok: int
    warn: int
    # NEW: implemented/verified with missing or stale evidence
    overdue: Optional[int] = None

class ScopeRef(BaseModel):
    type: Optional[str] = None
    id: Optional[int] = None
    label: Optional[str] = None

# Optional appetite snapshot for each context (nice-to-have)
class SlaDaysOut(BaseModel):
    amber: Optional[int] = None
    red: Optional[int] = None

class AppetiteOut(BaseModel):
    greenMax: int
    amberMax: int
    domainCaps: Dict[str, int] = Field(default_factory=dict)
    slaDays: SlaDaysOut

    class Config:
        extra = "ignore"  # tolerate resolver extras if any

# ---------- main items ----------

class RiskContextListItem(BaseModel):
    contextId: int
    scenarioId: int
    scenarioTitle: str

    scope: str
    scopeName: Optional[str] = None
    scopeRef: Optional[ScopeRef] = None           # NEW
    scopeDisplay: Optional[str] = None            # NEW

    assetId: Optional[int] = None                 # set only for scope='asset'
    assetName: Optional[str] = None

    ownerId: Optional[int] = None                 # NEW
    owner: str
    ownerInitials: str

    status: str
    likelihood: int
    impacts: Dict[str, int]
    domains: Optional[List[Literal["C","I","A","L","R"]]] = None  # NEW

    impactOverall: Optional[int] = None           # NEW (1–5)
    severity: Optional[int] = None                # NEW
    severityBand: Optional[Literal["Low","Medium","High","Critical"]] = None  # NEW
    overAppetite: Optional[bool] = None           # NEW

    initial: int
    residual: int
    residual_gated: Optional[float] = None
    targetResidual: Optional[float] = None
    trend: List[Dict[str, int]]

    controls: ControlsOut
    evidence: EvidenceOut

    updatedAt: Optional[str] = None
    lastReview: Optional[str] = None              # NEW
    nextReview: Optional[str] = None              # NEW
    reviewSLAStatus: Optional[Literal["OnTrack","DueSoon","Overdue"]] = None  # NEW

    appetite: Optional[AppetiteOut] = None        # NEW (nice-to-have)

    class Config:
        from_attributes = True

class RiskContextListResponse(BaseModel):
    total: int
    items: List[RiskContextListItem]
