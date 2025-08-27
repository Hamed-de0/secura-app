# app/schemas/m4/evidence.py

from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import date

EvidenceType = str  # "file" | "url" | "report" | ...

class EvidenceItemOut(BaseModel):
    id: int
    contextId: int
    controlId: Optional[int] = None
    linkId: int
    type: EvidenceType
    ref: Optional[str] = None
    capturedAt: Optional[date] = None
    validUntil: Optional[date] = None
    freshness: str
    class Config:
        from_attributes = True

class EvidenceListOut(BaseModel):
    total: int
    items: List[EvidenceItemOut]
    summary: Dict[str, int]

class EvidenceCreateIn(BaseModel):
    controlId: int
    type: EvidenceType
    title: str                   # ← REQUIRED by DB
    ref: Optional[str] = None
    capturedAt: Optional[date] = None
    validUntil: Optional[date] = None
    description: Optional[str] = None

class EvidenceUpdateIn(BaseModel):
    # all optional; only provided fields will be updated
    type: Optional[EvidenceType] = None
    title: Optional[str] = None
    ref: Optional[str] = None
    capturedAt: Optional[date] = None
    validUntil: Optional[date] = None
    description: Optional[str] = None
    status: Optional[str] = None  # if your workflow wants to update status