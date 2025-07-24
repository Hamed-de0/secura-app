from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AssetLifecycleEventBase(BaseModel):
    asset_id: int
    event_type: str
    timestamp: Optional[datetime]
    description: Optional[str]

class AssetLifecycleEventCreate(AssetLifecycleEventBase):
    pass

class AssetLifecycleEventRead(AssetLifecycleEventBase):
    id: int

    class Config:
        from_attributes  = True
