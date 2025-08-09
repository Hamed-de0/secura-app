from pydantic import BaseModel
from typing import Optional

class AssetTypeControlLinkBase(BaseModel):
    asset_type_id: int
    control_id: int

class AssetTypeControlLinkCreate(AssetTypeControlLinkBase):
    pass

class AssetTypeControlLinkOut(AssetTypeControlLinkBase):
    id: int

    class Config:
        from_attributes = True
