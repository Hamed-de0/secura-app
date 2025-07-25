from pydantic import BaseModel

class ControlRiskLinkCreate(BaseModel):
    control_id: int
    risk_scenario_id: int
