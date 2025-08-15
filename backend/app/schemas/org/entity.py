from typing import Optional, Dict, Any, List, Literal
from pydantic import BaseModel, Field

# --------- OrgEntity ---------
class OrgEntityBase(BaseModel):
    group_id: Optional[int] = None
    code: str = Field(..., max_length=50)
    name: str = Field(..., max_length=200)
    is_active: bool = True
    regulatory_profile: Dict[str, Any] = Field(default_factory=dict)
    meta: Dict[str, Any] = Field(default_factory=dict)

class OrgEntityCreate(OrgEntityBase):
    pass

class OrgEntityUpdate(BaseModel):
    group_id: Optional[int] = None
    code: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=200)
    is_active: Optional[bool] = None
    regulatory_profile: Optional[Dict[str, Any]] = None
    meta: Optional[Dict[str, Any]] = None

class OrgEntityOut(OrgEntityBase):
    id: int
    class Config:
        from_attributes = True

