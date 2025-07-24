from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AssetOwnerBase(BaseModel):
    asset_id: int
    person_id: int
    role: Optional[str]
    valid_from: Optional[datetime]
    valid_to: Optional[datetime]
    description: Optional[str]
    person_full_name: Optional[str]


class AssetOwnerCreate(AssetOwnerBase):
    pass

class AssetOwnerRead(AssetOwnerBase):
    id: int

    class Config:
        from_attributes  = True
