from pydantic import BaseModel, ConfigDict
from typing import Optional, List, ForwardRef
from datetime import datetime

AssetRead = ForwardRef("AssetRead")

class AssetBase(BaseModel):
    uuid: Optional[str]
    name: str
    type_id: Optional[int]
    group_id: Optional[int]
    description: Optional[str]

class AssetCreate(AssetBase):
    pass

class AssetRead(AssetBase):
    id: int
    children: Optional[List["AssetRead"]] = None  # ← Add this

    class Config:
        from_attributes  = True
AssetRead.model_rebuild()


class AssetTypeBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    create_at: Optional[datetime] = None
    enabled: Optional[bool] = True

class AssetTypeCreate(AssetTypeBase):
    pass

class AssetTypeRead(AssetTypeBase):
    id: int
    # model_config = ConfigDict(from_attributes=True)

    class Config:
        from_attributes  = True


class AssetGroupBase(BaseModel):
    name: str
    parent_id: Optional[int]
    description: Optional[str]

class AssetGroupCreate(AssetGroupBase):
    pass

class AssetGroupRead(AssetGroupBase):
    id: int

    class Config:
        from_attributes  = True


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


class AssetRelationBase(BaseModel):
    asset_id: int
    related_asset_id: int
    relation_type: Optional[str]
    description: Optional[str]

class AssetRelationCreate(AssetRelationBase):
    pass

class AssetRelationRead(AssetRelationBase):
    id: int

    class Config:
        from_attributes  = True


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


class AssetSecurityProfileBase(BaseModel):
    asset_id: int
    confidentiality: Optional[int]
    integrity: Optional[int]
    availability: Optional[int]
    classification: Optional[str]
    description: Optional[str]

class AssetSecurityProfileCreate(AssetSecurityProfileBase):
    pass

class AssetSecurityProfileRead(AssetSecurityProfileBase):
    id: int

    class Config:
        from_attributes  = True


