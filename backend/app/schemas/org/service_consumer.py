from typing import Optional, Dict, Any, List, Literal
from pydantic import BaseModel, Field
from datetime import date

# --------- OrgServiceConsumer ---------
class OrgServiceConsumerBase(BaseModel):
    service_id: int
    consumer_entity_id: int
    consumer_bu_id: Optional[int] = None

    inheritance_type: Literal["direct","conditional","advisory"] = "direct"
    responsibility: Literal["provider_owner","consumer_owner","shared"] = "shared"

    residual_consumer_tasks: List[Dict[str, Any]] = Field(default_factory=list)  # or simple List[str]

    agreement_type: Optional[str] = Field(None, description="ICA|DPA|MSA|SLA|OTHER")
    agreement_ref: Optional[str] = None
    start_date: Optional[date] = None  # ISO date
    end_date: Optional[date] = None
    notes: Optional[str] = None

class OrgServiceConsumerCreate(OrgServiceConsumerBase):
    pass

class OrgServiceConsumerUpdate(BaseModel):
    consumer_entity_id: Optional[int] = None
    consumer_bu_id: Optional[int] = None
    inheritance_type: Optional[Literal["direct","conditional","advisory"]] = None
    responsibility: Optional[Literal["provider_owner","consumer_owner","shared"]] = None
    residual_consumer_tasks: Optional[List[Dict[str, Any]]] = None
    agreement_type: Optional[str] = None
    agreement_ref: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None

class OrgServiceConsumerOut(OrgServiceConsumerBase):
    id: int
    class Config:
        from_attributes = True

