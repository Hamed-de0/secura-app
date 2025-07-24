from pydantic import BaseModel

class VulnerabilityThreatLinkBase(BaseModel):
    threat_id: int
    vulnerability_id: int

class VulnerabilityThreatLinkCreate(VulnerabilityThreatLinkBase):
    pass

class VulnerabilityThreatLinkRead(VulnerabilityThreatLinkBase):
    id: int

    class Config:
        from_attributes = True
