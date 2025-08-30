from typing import List, Optional, Literal
from pydantic import BaseModel

ReqStatus = Literal["met", "partial", "gap", "unknown"]

class RequirementStatusItem(BaseModel):
    requirement_id: int
    code: str
    title: Optional[str] = None
    status: ReqStatus
    score: float                  # 0..1
    exception_applied: bool = False

    # Hierarchy info (NEW)
    parent_id: Optional[int] = None
    top_level_id: Optional[int] = None
    top_level_code: Optional[str] = None
    breadcrumb: Optional[str] = None       # e.g., "A.5 > A.5.1 > A.5.1.1"

class RequirementsStatusPage(BaseModel):
    version_id: int
    scope_type: str
    scope_id: int
    page: int
    size: int
    total: int
    items: List[RequirementStatusItem]
