from pydantic import BaseModel, ConfigDict
from typing import Optional

class FrameworkRequirementBase(BaseModel):
    framework_id: int
    code: str
    title: str
    notes: Optional[str] = None
    model_config = ConfigDict(extra="ignore")

class FrameworkRequirementCreate(FrameworkRequirementBase): pass
class FrameworkRequirementUpdate(BaseModel):
    code: Optional[str] = None
    title: Optional[str] = None
    notes: Optional[str] = None
class FrameworkRequirementOut(FrameworkRequirementBase):
    id: int
