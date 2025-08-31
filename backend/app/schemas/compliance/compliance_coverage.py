from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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
