from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AssetScanBase(BaseModel):
    asset_id: int
    scanner: str
    status: Optional[str]
    scan_date: Optional[datetime]
    vulns_found: Optional[int]
    report_url: Optional[str]
    description: Optional[str]

class AssetScanCreate(AssetScanBase):
    pass

class AssetScanRead(AssetScanBase):
    id: int

    class Config:
        from_attributes  = True
