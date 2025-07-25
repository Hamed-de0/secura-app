from pydantic import BaseModel
from typing import Optional, List
from app.core.enums import ControlType, ControlStatus


class ControlBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: ControlType
    status: Optional[ControlStatus] = ControlStatus.proposed
    standard_refs: Optional[List[str]] = None
    owner_id: Optional[int] = None


class ControlCreate(ControlBase):
    pass


class ControlUpdate(ControlBase):
    pass


class ControlRead(ControlBase):
    id: int

    class Config:
        from_attributes = True
