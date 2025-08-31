# app/schemas/compliance/coverage.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ControlContribution(BaseModel):
    control_id: int
    source: str  # direct|provider|baseline
    assurance_status: str
    relation_type: str  # satisfies|supports|enables
    coverage_level: Optional[str] = None  # full|partial|conditional
    contribution: float  # capped contribution toward the atom

class AtomCoverage(BaseModel):
    atom_id: int
    atom_key: Optional[str] = None
    title: Optional[str] = None
    weight: int = 100
    score: float  # 0..1
    contributors: List[ControlContribution] = []

class RequirementCoverage(BaseModel):
    requirement_id: int
    code: Optional[str] = None
    title: Optional[str] = None
    score: float  # 0..1 (weighted by atom weights)
    atoms: List[AtomCoverage]

class FrameworkCoverage(BaseModel):
    framework: str
    version: str
    score: float
    requirements: List[RequirementCoverage]



class CoverageRollupItem(BaseModel):
    scope_type: str
    met: int
    met_by_exception: int
    partial: int
    gap: int
    unknown: int
    applicable_requirements: int

class CoverageRollupResponse(BaseModel):
    version_id: int
    computed_at: Optional[datetime] = None
    items: List[CoverageRollupItem]

#
# class RequirementCoverageItem(BaseModel):
#     requirement_id: int
#     code: str
#     title: Optional[str] = None
#     mapped_controls_count: int
#     control_ids: List[int]
#
# class FrameworkCoverageSummary(BaseModel):
#     framework_id: int
#     total_requirements: int
#     mapped_requirements: int
#     percent_mapped: float
#     details: List[RequirementCoverageItem]
