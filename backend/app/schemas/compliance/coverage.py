from pydantic import BaseModel
from typing import List, Optional

class RequirementCoverageItem(BaseModel):
    requirement_id: int
    code: str
    title: Optional[str] = None
    mapped_controls_count: int
    control_ids: List[int]

class FrameworkCoverageSummary(BaseModel):
    framework_id: int
    total_requirements: int
    mapped_requirements: int
    percent_mapped: float
    details: List[RequirementCoverageItem]
