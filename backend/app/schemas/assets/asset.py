from pydantic import BaseModel
from typing import Optional, List, ForwardRef

AssetRead = ForwardRef("AssetRead")

class AssetBase(BaseModel):
    name: str
    description: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetRead(AssetBase):
    id: int
    children: Optional[List["AssetRead"]] = None

    class Config:
        from_attributes = True

AssetRead.model_rebuild()
