from pydantic import BaseModel, ConfigDict
from typing import Optional

class ControlFrameworkMappingBase(BaseModel):
    framework_requirement_id: int
    control_id: int
    weight: int = 100
    notes: Optional[str] = None
    model_config = ConfigDict(extra="ignore")

class ControlFrameworkMappingCreate(ControlFrameworkMappingBase): pass
class ControlFrameworkMappingUpdate(BaseModel):
    weight: Optional[int] = None
    notes: Optional[str] = None
class ControlFrameworkMappingOut(ControlFrameworkMappingBase):
    id: int
