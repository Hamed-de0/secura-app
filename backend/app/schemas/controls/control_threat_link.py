from pydantic import BaseModel

class ControlThreatLinkCreate(BaseModel):
    control_id: int
    threat_id: int
