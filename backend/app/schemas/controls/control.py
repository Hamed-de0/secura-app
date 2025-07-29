from pydantic import BaseModel
from typing import Optional, List
from app.core.enums import ControlType, ControlStatus


class ControlBase(BaseModel):
    reference_code: str
    title_en: str
    title_de: str = None
    description_en: Optional[str] = None
    description_de: Optional[str] = None
    control_source: Optional[str] = None
    control_type: List[str] = None
    control_concept: List[str] = None
    properties: List[str] = None
    capabilities: List[str] = None
    security_domains: List[str] = None
    owner_id: Optional[int] = None

    # name: str
    # description: Optional[str] = None
    # type: ControlType
    # status: Optional[ControlStatus] = ControlStatus.proposed
    # standard_refs: Optional[List[str]] = None
    # owner_id: Optional[int] = None


class ControlCreate(ControlBase):
    pass


class ControlUpdate(ControlBase):
    pass


class ControlRead(ControlBase):
    id: int

    class Config:
        from_attributes = True
