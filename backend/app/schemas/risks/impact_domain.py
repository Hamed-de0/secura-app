from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ImpactDomainBase(BaseModel):
    name: str
    description: Optional[str] = None

class ImpactDomainCreate(ImpactDomainBase):
    pass

class ImpactDomainRead(ImpactDomainBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
