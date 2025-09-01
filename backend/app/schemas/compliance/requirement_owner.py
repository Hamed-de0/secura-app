from __future__ import annotations
from pydantic import BaseModel
from typing import Optional

class RequirementOwnerBase(BaseModel):
    scope_type: str
    scope_id: int
    user_id: int
    role: str = "owner"

class RequirementOwnerCreate(RequirementOwnerBase):
    pass

class RequirementOwnerRead(RequirementOwnerBase):
    id: int
    class Config:
        from_attributes = True  # Pydantic v2 (or orm_mode=True for v1)
