from pydantic import BaseModel
from typing import Optional
from datetime import date  # ✅ add this

class FrameworkVersionCreate(BaseModel):
    framework_id: int
    version_label: str
    effective_from: Optional[date] = None   # ✅ use date, not str
    effective_to: Optional[date] = None     # ✅
    notes: Optional[str] = None

class FrameworkVersionUpdate(BaseModel):
    version_label: Optional[str] = None
    effective_from: Optional[date] = None   # ✅
    effective_to: Optional[date] = None     # ✅
    notes: Optional[str] = None

class FrameworkVersionOut(BaseModel):
    id: int
    framework_id: int
    version_label: str
    effective_from: Optional[date] = None   # ✅
    effective_to: Optional[date] = None     # ✅
    notes: Optional[str] = None

    class Config:
        from_attributes = True
