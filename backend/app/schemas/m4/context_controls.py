# app/schemas/m4/context_controls.py
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Dict
from datetime import date

Status = Literal[
    "proposed","mapped","planning","implementing","implemented",
    "monitoring","analyzing","evidenced","fresh","expired"
]

class ContextControlOut(BaseModel):
    id: int
    contextId: int
    controlId: int
    code: Optional[str] = None
    title: Optional[str] = None
    status: Status
    lastEvidenceAt: Optional[date] = None

    class Config:
        from_attributes = True

class ContextControlCreate(BaseModel):
    controlId: int
    status: Status

class ContextControlUpdate(BaseModel):
    status: Optional[Status] = None

class ContextControlsSummary(BaseModel):
    countsByStatus: Dict[str, int]
    lastEvidenceMax: Optional[date] = None

class ContextControlsListOut(BaseModel):
    total: int
    items: List[ContextControlOut]
    summary: Optional[ContextControlsSummary] = None
