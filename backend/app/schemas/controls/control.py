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
    category: Optional[str] = None



class ControlCreate(ControlBase):
    pass


class ControlUpdate(ControlBase):
    pass


class ControlRead(ControlBase):
    id: int

    class Config:
        from_attributes = True

class ControlsPage(BaseModel):
    data: List[ControlRead]
    full_count: int

    class Config:
        from_attributes = True
