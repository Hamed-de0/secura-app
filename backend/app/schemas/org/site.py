from typing import Optional, Dict, Any, List, Literal
from pydantic import BaseModel, Field

# --------- OrgSite ---------
class OrgSiteBase(BaseModel):
    entity_id: int
    code: str = Field(..., max_length=50)
    name: str = Field(..., max_length=200)
    is_active: bool = True
    meta: Dict[str, Any] = Field(default_factory=dict)

class OrgSiteCreate(OrgSiteBase):
    pass

class OrgSiteUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=200)
    is_active: Optional[bool] = None
    meta: Optional[Dict[str, Any]] = None

class OrgSiteOut(OrgSiteBase):
    id: int
    class Config:
        from_attributes = True

