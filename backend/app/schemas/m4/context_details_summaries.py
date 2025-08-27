# app/schemas/m4/context_details_summaries.py
from __future__ import annotations
from pydantic import BaseModel
from typing import Dict, Optional

class ControlsSummaryOut(BaseModel):
    countsByStatus: Dict[str, int]
    coverageWeighted: Optional[float] = None
    lastEvidenceMax: Optional[str] = None  # ISO date

class EvidenceSummaryOut(BaseModel):
    ok: int
    warn: int
    overdue: int
    lastEvidenceMax: Optional[str] = None  # ISO date

class ContextSummariesOut(BaseModel):
    controlsSummary: ControlsSummaryOut
    evidenceSummary: EvidenceSummaryOut
