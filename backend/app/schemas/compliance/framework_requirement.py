from pydantic import BaseModel
from typing import Optional

class FrameworkRequirementBase(BaseModel):
    code: Optional[str] = None
    title: Optional[str] = None
    text: Optional[str] = None
    parent_id: Optional[int] = None
    sort_index: Optional[int] = 0

class FrameworkRequirementCreate(FrameworkRequirementBase):
    # ⬇️ change: version-level scoping
    framework_version_id: Optional[int] = None  # set from path

class FrameworkRequirementUpdate(FrameworkRequirementBase):
    pass

class FrameworkRequirementOut(BaseModel):
    id: int
    framework_version_id: int
    code: Optional[str] = None
    title: Optional[str] = None
    text: Optional[str] = None
    parent_id: Optional[int] = None
    sort_index: int

    class Config:
        from_attributes = True
