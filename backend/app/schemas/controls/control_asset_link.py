from pydantic import BaseModel

class ControlAssetLinkCreate(BaseModel):
    control_id: int
    asset_id: int
