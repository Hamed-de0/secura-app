from pydantic import BaseModel
from typing import Optional

class AssetTypeThreatLinkBase(BaseModel):
    asset_type_id: int
    threat_id: int

class AssetTypeThreatLinkCreate(AssetTypeThreatLinkBase):
    pass

class AssetTypeThreatLinkOut(AssetTypeThreatLinkBase):
    id: int

    class Config:
        orm_mode = True
