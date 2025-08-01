from pydantic import BaseModel, RootModel
from typing import Optional, List


class AssetTagBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None

class AssetTagCreate(AssetTagBase):
    pass

class AssetTagRead(AssetTagBase):
    id: int

    class Config:
        from_attributes = True


class AssetTagUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class AssetTagBulkCreate(RootModel[List[AssetTagCreate]]):
    pass
