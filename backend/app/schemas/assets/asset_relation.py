from pydantic import BaseModel
from typing import Optional


class AssetRelationBase(BaseModel):
    asset_id: int
    related_asset_id: int
    relation_type: Optional[str]
    description: Optional[str]

class AssetRelationCreate(AssetRelationBase):
    pass

class AssetRelationRead(AssetRelationBase):
    id: int

    class Config:
        from_attributes  = True

