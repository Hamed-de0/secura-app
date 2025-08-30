from typing import List, Optional
from pydantic import BaseModel

class RequirementTreeNode(BaseModel):
    id: int
    code: Optional[str] = None
    title: Optional[str] = None
    parent_id: Optional[int] = None
    sort_index: int = 0
    children: List["RequirementTreeNode"] = []

    class Config:
        arbitrary_types_allowed = True

RequirementTreeNode.update_forward_refs()
