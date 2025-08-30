from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel

StaleStatus = Literal["expired", "expiring_soon"]

class EvidenceStalenessItem(BaseModel):
    evidence_id: int
    control_context_link_id: int
    control_id: int
    control_name: Optional[str] = None

    # Scope (derived via RiskScenarioContext)
    scope_type: Optional[str] = None
    scope_id: Optional[int] = None

    collected_at: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    days_remaining: Optional[int] = None  # negative if expired
    status: StaleStatus

    # optional, handy in UI
    uri: Optional[str] = None
    notes: Optional[str] = None

class EvidenceStalenessResponse(BaseModel):
    now: datetime
    within_days: int
    expired_count: int
    expiring_soon_count: int
    items: List[EvidenceStalenessItem]
