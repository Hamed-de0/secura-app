from pydantic import BaseModel, ConfigDict
from typing import Optional

class FrameworkBase(BaseModel):
    name: str
    owner: Optional[str] = None
    notes: Optional[str] = None
    model_config = ConfigDict(extra="ignore")

class FrameworkCreate(FrameworkBase): pass
class FrameworkUpdate(BaseModel):
    name: Optional[str] = None
    owner: Optional[str] = None
    notes: Optional[str] = None
class FrameworkOut(FrameworkBase):
    id: int
