from pydantic import BaseModel
from typing import Optional, List

class AssetTypeThreatLinkBase(BaseModel):
    asset_type_id: int
    threat_id: int
    score: Optional[float]
    justification: Optional[str]

class AssetTypeThreatLinkCreate(AssetTypeThreatLinkBase):
    pass

class AssetTypeThreatLinkOut(AssetTypeThreatLinkBase):
    id: int

    class Config:
        from_attributes = True

class AssetTypeThreatLinkOutDetails(BaseModel):
    # From link table
    id: int
    threat_id: int
    asset_type_id: int
    score: Optional[int] = None
    justification: Optional[str] = None

    # From Threat table
    reference_code: str
    name: str
    category: str
    source: str
    description: Optional[str] = None

    class Config:
        from_attributes = True