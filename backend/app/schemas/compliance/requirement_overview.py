from __future__ import annotations
from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field


StatusKey = Literal["met", "partial", "gap", "unknown"]


class OverviewHeader(BaseModel):
    id: int
    code: str
    title: str
    breadcrumbs: List[str] = Field(default_factory=list)


class StatusSummary(BaseModel):
    met: int = 0
    partial: int = 0
    gap: int = 0
    unknown: int = 0


class UsageItem(BaseModel):
    scope_type: str
    count: int


class MappingContext(BaseModel):
    context_link_id: int
    scope_type: str
    scope_id: int
    status: StatusKey = "unknown"
    evidence_count: int = 0
    last_evidence_at: Optional[str] = None  # ISO string


class MappingControl(BaseModel):
    control_id: int
    control_code: str
    title: str
    contexts: List[MappingContext] = Field(default_factory=list)


class EvidenceItem(BaseModel):
    evidence_id: int
    title: str
    control_context_link_id: Optional[int] = None
    type: Optional[str] = None
    url: Optional[str] = None
    file_path: Optional[str] = None
    collected_at: Optional[str] = None
    valid_until: Optional[str] = None
    status: Optional[str] = None  # valid|expired|unknown


class ExceptionItem(BaseModel):
    id: int
    scope_type: Optional[str] = None
    scope_id: Optional[int] = None
    title: Optional[str] = None
    reason: Optional[str] = None
    status: Optional[str] = None
    expires_at: Optional[str] = None


class TimelineEvent(BaseModel):
    id: Optional[int] = None
    ts: str
    event: str
    actor: Optional[str] = None
    note: Optional[str] = None
    evidence_id: Optional[int] = None


class OwnerItem(BaseModel):
    scope_type: str
    scope_id: int
    user_id: int
    name: Optional[str] = None
    role: Optional[str] = "owner"


class SuggestedControl(BaseModel):
    control_id: int
    control_code: Optional[str] = None
    title: Optional[str] = None
    reason: Optional[str] = None
    score: Optional[float] = None


class RequirementOverviewResponse(BaseModel):
    header: OverviewHeader
    status_summary: StatusSummary = StatusSummary()
    usage: List[UsageItem] = Field(default_factory=list)
    mappings: List[MappingControl] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    exceptions: List[ExceptionItem] = Field(default_factory=list)
    lifecycle: List[TimelineEvent] = Field(default_factory=list)
    owners: List[OwnerItem] = Field(default_factory=list)
    suggested_controls: List[SuggestedControl] = Field(default_factory=list)
