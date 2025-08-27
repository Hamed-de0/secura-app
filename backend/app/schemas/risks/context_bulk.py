from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.risks.risk_scenario_context import ScopeRef


class BulkCreateItem(BaseModel):
    scenarioId: int
    scopeRef: ScopeRef
    likelihood: Optional[int] = None
    impacts: Optional[Dict[str, int]] = None  # keys: C,I,A,L,R
    ownerId: Optional[int] = None
    nextReview: Optional[datetime] = None
    # future: onConflict: Literal["skip","update"] = "skip"


class BulkCreateRequest(BaseModel):
    items: List[BulkCreateItem]
    idempotencyKey: Optional[str] = None  # reserved; wrapper is idempotent by skip semantics


class BulkCreateResponse(BaseModel):
    createdIds: List[int] = []
    skipped: List[dict] = []  # {scenarioId, scopeRef}
    updated: List[int] = []

