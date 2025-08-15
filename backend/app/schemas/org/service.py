from typing import Optional, Dict, Any, List, Literal
from pydantic import BaseModel, Field

# --------- OrgService ---------
class OrgServiceBase(BaseModel):
    provider_entity_id: int
    provider_bu_id: Optional[int] = None
    code: str = Field(..., max_length=60)
    name: str = Field(..., max_length=200)
    service_type: Optional[str] = Field(None, description="accounting|soc|it_platform|hr|legal|dpo|other")
    is_active: bool = True
    meta: Dict[str, Any] = Field(default_factory=dict)

class OrgServiceCreate(OrgServiceBase):
    pass

class OrgServiceUpdate(BaseModel):
    provider_entity_id: Optional[int] = None
    provider_bu_id: Optional[int] = None
    code: Optional[str] = Field(None, max_length=60)
    name: Optional[str] = Field(None, max_length=200)
    service_type: Optional[str] = None
    is_active: Optional[bool] = None
    meta: Optional[Dict[str, Any]] = None

class OrgServiceOut(OrgServiceBase):
    id: int
    class Config:
        from_attributes = True

