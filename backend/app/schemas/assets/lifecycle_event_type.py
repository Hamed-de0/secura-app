from pydantic import BaseModel
from typing import Optional

class LifecycleEventTypeBase(BaseModel):
    name: str
    description: Optional[str] = None

class LifecycleEventTypeCreate(LifecycleEventTypeBase):
    pass

class LifecycleEventTypeRead(LifecycleEventTypeBase):
    id: int

    class Config:
        from_attributes = True
