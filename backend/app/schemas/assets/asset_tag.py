from pydantic import BaseModel
from typing import Optional

class AssetTagBase(BaseModel):
    name: str
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


