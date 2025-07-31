from pydantic import BaseModel
from typing import Optional, List, ForwardRef, Dict, Any
from datetime import datetime

AssetRead = ForwardRef("AssetRead")

class AssetBase(BaseModel):
    name: str
    description: Optional[str] = None
    type_id: int
    group_id: int
    location: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type_id: Optional[int] = None
    group_id: Optional[int] = None
    location: Optional[str] = None
    enabled: Optional[bool] = None
    details: Optional[Dict[str, Any]] = None

class AssetRead(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime
    enabled: bool
    children: Optional[List["AssetRead"]] = None

    class Config:
        from_attributes = True

AssetRead.model_rebuild()
