from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AssetMaintenanceBase(BaseModel):
    asset_id: int
    maintenance_type: str
    performed_by: str
    timestamp: Optional[datetime]
    description: Optional[str]

class AssetMaintenanceCreate(AssetMaintenanceBase):
    pass

class AssetMaintenanceRead(AssetMaintenanceBase):
    id: int

    class Config:
        from_attributes  = True

