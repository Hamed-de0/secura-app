from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
from datetime import datetime

class SlaDaysOut(BaseModel):
    amber: Optional[int] = None
    red: Optional[int] = None

class AppetiteOut(BaseModel):
    greenMax: int
    amberMax: int
    domainCaps: Dict[str, int] = Field(default_factory=dict)
    slaDays: SlaDaysOut
    class Config:
        extra = "ignore"

class EvidenceOut(BaseModel):
    ok: int
    warn: int
    overdue: Optional[int] = None

class ControlsOut(BaseModel):
    implemented: int
    total: int
    recommended: List[str]
    implementedList: List[str]
    coverage: Optional[float] = None

class ScopeRef(BaseModel):
    type: Optional[str] = None
    id: Optional[int] = None
    label: Optional[str] = None

class ControlLinkDetails(BaseModel):
    linkId: int
    controlId: int
    name: str
    referenceCode: Optional[str] = None
    assuranceStatus: Optional[str] = None
    statusUpdatedAt: Optional[datetime] = None
    evidenceUpdatedAt: Optional[datetime] = None
    effectivenessOverride: Optional[Dict[str, float]] = None
    notes: Optional[str] = None

class ExceptionOut(BaseModel):
    id: int
    title: Optional[str] = None
    status: Optional[str] = None
    active: Optional[bool] = None
    expiresAt: Optional[datetime] = None


class ControlsSummaryOut(BaseModel):
    countsByStatus: Dict[str, int]
    coverageWeighted: Optional[float] = None
    lastEvidenceMax: Optional[str] = None


class EvidenceSummaryOut(BaseModel):
    ok: int
    warn: int
    overdue: int
    lastEvidenceMax: Optional[str] = None


class RiskContextDetails(BaseModel):
    contextId: int
    scenarioId: int
    scenarioTitle: str
    scenarioDescription: Optional[str] = None

    scope: str
    scopeRef: ScopeRef
    scopeDisplay: Optional[str] = None

    ownerId: Optional[int] = None
    owner: Optional[str] = None
    ownerInitials: Optional[str] = None

    status: str
    likelihood: int
    impacts: Dict[str, int]
    domains: List[Literal["C","I","A","L","R"]]

    initial: int
    residual: int
    severity: int
    severityBand: Literal["Low","Medium","High","Critical"]
    overAppetite: bool
    rag: Literal["Green","Amber","Red"]

    trend: List[Dict[str, int]]
    lastUpdated: Optional[datetime] = None

    controls: ControlsOut
    controlLinks: List[ControlLinkDetails]
    evidence: EvidenceOut
    compliance: List[str]
    appetite: AppetiteOut

    lastReview: Optional[datetime] = None
    nextReview: Optional[datetime] = None
    reviewSLAStatus: Optional[Literal["OnTrack","DueSoon","Overdue"]] = None

    exceptions: List[ExceptionOut] = []

    asOf: datetime

    controlsSummary: ControlsSummaryOut
    evidenceSummary: EvidenceSummaryOut

    class Config:
        extra = "allow"
