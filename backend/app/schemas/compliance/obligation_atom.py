# =============================================
# app/schemas/compliance/obligation_atom.py
# =============================================
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class ObligationAtomBase(BaseModel):
    framework_requirement_id: int = Field(..., description="FK to framework_requirements.id")
    atom_key: str = Field(..., max_length=50, description="Stable key within the article, e.g. 'Art.32(1)(b)' or 'A2'")

    role: Optional[str] = Field(None, description="controller | processor | both")
    obligation_text: str = Field(..., description="Short paraphrase of the 'shall' obligation")
    condition: Optional[str] = None
    outcome: Optional[str] = None
    citation: Optional[str] = None

    applicability: Optional[Dict] = Field(None, description="Freeform JSON flags, e.g. { 'xborder': False }")
    evidence_hint: Optional[List[str]] = Field(None, description="List of suggested evidence types")
    sort_index: int = 0


class ObligationAtomCreate(ObligationAtomBase):
    pass


class ObligationAtomUpdate(BaseModel):
    atom_key: Optional[str] = Field(None, max_length=50)
    role: Optional[str] = None
    obligation_text: Optional[str] = None
    condition: Optional[str] = None
    outcome: Optional[str] = None
    citation: Optional[str] = None
    applicability: Optional[Dict] = None
    evidence_hint: Optional[List[str]] = None
    sort_index: Optional[int] = None


class ObligationAtomOut(ObligationAtomBase):
    id: int

    class Config:
        from_attributes = True