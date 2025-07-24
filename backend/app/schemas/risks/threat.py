from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ThreatBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    reference_code: Optional[str] = None
    risk_source: Optional[List[str]] = None

class ThreatCreate(ThreatBase):
    pass


class ThreatUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    reference_code: Optional[str] = None
    risk_source: Optional[List[str]] = None


class ThreatRead(ThreatBase):
    id: int
    created_at: datetime
    updated_at: datetime
    enabled: bool

    class Config:
        from_attributes = True
