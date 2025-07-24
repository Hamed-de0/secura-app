from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AssetTypeBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None

class AssetTypeCreate(AssetTypeBase):
    # enabled: Optional[bool] = True  # ✅ included in POST body if you want it
    pass

class AssetTypeRead(AssetTypeBase):
    id: int
    enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
