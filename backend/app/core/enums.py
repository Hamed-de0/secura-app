from enum import Enum

# Risk Treatment Actions — CISSP & ISO-aligned
class RiskTreatmentOption(str, Enum):
    mitigate = "Mitigate"
    accept = "Accept"
    transfer = "Transfer"
    avoid = "Avoid"

# Control Functional Types — CISSP-based
class ControlType(str, Enum):
    preventive = "Preventive"
    detective = "Detective"
    corrective = "Corrective"
    deterrent = "Deterrent"
    compensating = "Compensating"
    recovery = "Recovery"
    directive = "Directive"

# Control Implementation Status
class ControlStatus(str, Enum):
    proposed = "Proposed"
    in_progress = "In Progress"
    implemented = "Implemented"
    verified = "Verified"

# Asset Lifecycle Event Types
class LifecycleEvents(str, Enum):
    acquired = "Acquired"

