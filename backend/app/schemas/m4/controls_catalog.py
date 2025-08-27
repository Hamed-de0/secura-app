# app/schemas/m4/controls_catalog.py
from __future__ import annotations
from pydantic import BaseModel
from typing import List, Optional

class ControlCatalogItem(BaseModel):
    id: int
    code: Optional[str] = None
    title: Optional[str] = None

    class Config:
        from_attributes = True

class ControlsCatalogListOut(BaseModel):
    total: int
    items: List[ControlCatalogItem]
