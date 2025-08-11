from pydantic import BaseModel
from typing import List, Dict, Optional

class ControlsOut(BaseModel):
    implemented: int
    total: int
    recommended: List[str]
    implementedList: List[str]

class EvidenceOut(BaseModel):
    ok: int
    warn: int

class RiskContextListItem(BaseModel):
    contextId: int
    scenarioId: int
    scenarioTitle: str
    scope: str
    scopeName: Optional[str] = None
    assetId: Optional[int] = None
    assetName: Optional[str] = None
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
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True

class RiskContextListResponse(BaseModel):
    total: int
    items: List[RiskContextListItem]
