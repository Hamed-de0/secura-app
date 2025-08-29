from pydantic import BaseModel, Field
from typing import List, Optional, Union, Literal
from datetime import datetime


class ChangeItem(BaseModel):
    ts: datetime
    type: Literal['residual', 'evidence', 'acceptance']
    subtype: Optional[str] = None
    entityId: Optional[int] = None
    field: Optional[str] = None
    from_: Optional[Union[str, float, int]] = Field(default=None, alias='from')
    to: Optional[Union[str, float, int]] = None
    actor: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        extra = "ignore"


class ContextChangesOut(BaseModel):
    changes: List[ChangeItem]
    nextCursor: Optional[str] = None

    class Config:
        extra = "ignore"
