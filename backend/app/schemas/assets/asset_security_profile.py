from pydantic import BaseModel
from typing import Optional

class AssetSecurityProfileBase(BaseModel):
    asset_id: int
    confidentiality: Optional[int]
    integrity: Optional[int]
    availability: Optional[int]
    classification: Optional[str]
    description: Optional[str]

class AssetSecurityProfileCreate(AssetSecurityProfileBase):
    pass

class AssetSecurityProfileRead(AssetSecurityProfileBase):
    id: int

    class Config:
        from_attributes  = True
