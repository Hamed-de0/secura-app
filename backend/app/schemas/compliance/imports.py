from pydantic import BaseModel, Field
from typing import Optional, List

class RequirementCsvRow(BaseModel):
    code: str = Field(..., min_length=1)
    title: Optional[str] = None
    text: Optional[str] = None
    parent_code: Optional[str] = None

class ImportResult(BaseModel):
    framework_version_id: int
    total_rows: int
    created: int
    updated: int
    linked_parents: int
    dry_run: bool
    skipped: int = 0
    errors: List[str] = []
