from typing import Optional, Dict, Any, List, Literal
from pydantic import BaseModel, Field

# --------- OrgGroup ---------
class OrgGroupBase(BaseModel):
    code: str = Field(..., max_length=50)
    name: str = Field(..., max_length=200)
    is_active: bool = True
    meta: Dict[str, Any] = Field(default_factory=dict)

class OrgGroupCreate(OrgGroupBase):
    pass

class OrgGroupUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=200)
    is_active: Optional[bool] = None
    meta: Optional[Dict[str, Any]] = None

class OrgGroupOut(OrgGroupBase):
    id: int
    class Config:
        from_attributes = True

