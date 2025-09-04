from pydantic import BaseModel
from typing import Optional
from datetime import date

class FrameworkVersionCreate(BaseModel):
    framework_id: int
    version_label: str
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None
    notes: Optional[str] = None
    enabled: Optional[bool] = True

class FrameworkVersionUpdate(BaseModel):
    version_label: Optional[str] = None
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None
    notes: Optional[str] = None
    enabled: Optional[bool] = True

class FrameworkVersionOut(BaseModel):
    id: int
    framework_id: int
    version_label: str
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None
    notes: Optional[str] = None
    enabled: Optional[bool] = True

    class Config:
        from_attributes = True

class FrameworksWithVersions(BaseModel):
    version_id: int
    framework_id: int
    version_label: str
    framework_name: str
    enabled: bool

    class Config:
        from_attributes = True


