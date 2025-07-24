from pydantic import BaseModel
from typing import Optional, List, ForwardRef

class AssetGroupBase(BaseModel):
    name: str
    parent_id: Optional[int] = None
    description: Optional[str] = None

class AssetGroupCreate(AssetGroupBase):
    pass

class AssetGroupRead(AssetGroupBase):
    id: int

    class Config:
        from_attributes  = True

