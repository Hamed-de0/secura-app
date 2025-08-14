from pydantic import BaseModel, Field
from typing import Optional

class EvidencePolicyCreate(BaseModel):
    control_id: Optional[int] = Field(None, description="Target control OR requirement")
    framework_requirement_id: Optional[int] = Field(None, description="Mutually exclusive with control_id")
    freshness_days: int
    notes: Optional[str] = None

class EvidencePolicyUpdate(BaseModel):
    freshness_days: Optional[int] = None
    notes: Optional[str] = None

class EvidencePolicyOut(BaseModel):
    id: int
    control_id: Optional[int]
    framework_requirement_id: Optional[int]
    freshness_days: int
    notes: Optional[str] = None

    class Config:
        from_attributes = True
