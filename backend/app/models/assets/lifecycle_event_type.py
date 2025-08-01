from sqlalchemy import Column, String
from app.core.base import BaseMain

class LifecycleEventType(BaseMain):
    __tablename__ = "lifecycle_event_types"

    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
