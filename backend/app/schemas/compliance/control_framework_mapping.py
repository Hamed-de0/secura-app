# ==========================================================
# app/schemas/compliance/control_framework_mapping.py (patch)
# ==========================================================
# NOTE: This file shows only the NEW/UPDATED Pydantic models.
# Merge with your existing mapping schemas.

from typing import Optional, List, Dict
from pydantic import BaseModel, Field, conint


class ControlFrameworkMappingBase(BaseModel):
    framework_requirement_id: int
    control_id: int

    # NEW: optional atom pointer
    obligation_atom_id: Optional[int] = Field(
        None, description="If set, this mapping targets a specific obligation atom; otherwise article-level"
    )

    # NEW: mapping semantics (keep as strings for now)
    relation_type: Optional[str] = Field(
        None, description="satisfies | supports | enables"
    )
    coverage_level: Optional[str] = Field(
        None, description="full | partial | conditional"
    )

    applicability: Optional[Dict] = None
    evidence_hint: Optional[List[str]] = None
    rationale: Optional[str] = Field(None, max_length=1024)

    weight: conint(ge=0, le=1000) = 100
    notes: Optional[str] = Field(None, max_length=1024)


class ControlFrameworkMappingCreate(ControlFrameworkMappingBase):
    pass


class ControlFrameworkMappingUpdate(BaseModel):
    obligation_atom_id: Optional[int] = None
    relation_type: Optional[str] = None
    coverage_level: Optional[str] = None
    applicability: Optional[Dict] = None
    evidence_hint: Optional[List[str]] = None
    rationale: Optional[str] = Field(None, max_length=1024)
    weight: Optional[conint(ge=0, le=1000)] = None
    notes: Optional[str] = Field(None, max_length=1024)


class ControlFrameworkMappingOut(ControlFrameworkMappingBase):
    id: int

    class Config:
        from_attributes = True

class ControlFrameworkMappingNamesOut(ControlFrameworkMappingBase):
    id: int
    control_title: Optional[str]
    control_code: Optional[str]
    framework_requirement_title: Optional[str] = None
    framework_requirement_code: Optional[str] = None
    obligation_atom_name: Optional[str] = None
    obligation_atom_code: Optional[str] = None


    class Config:
        from_attributes = True