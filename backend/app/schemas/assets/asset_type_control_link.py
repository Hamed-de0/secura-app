from pydantic import BaseModel
from typing import Optional

class AssetTypeControlLinkBase(BaseModel):
    asset_type_id: int
    control_id: int
    score: Optional[float]
    justification: Optional[str]

class AssetTypeControlLinkCreate(AssetTypeControlLinkBase):
    pass

class AssetTypeControlLinkOut(AssetTypeControlLinkBase):
    id: int

    class Config:
        from_attributes = True

class AssetTypeControlLinkOutDetails(BaseModel):
    # From link table
    id: int
    control_id: int
    asset_type_id: int
    score: Optional[float] = None
    justification: Optional[str] = None

    # From Threat table
    reference_code: str
    title_en: str
    category: str
    control_source: str
    description_en: Optional[str] = None

    class Config:
        from_attributes = True
