from sqlalchemy import Column, Integer, String
from app.core.base import Base

class Framework(Base):
    __tablename__ = "frameworks"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)        # e.g., "ISO 27001"
    version = Column(String(50), nullable=True)       # e.g., "2022"
    owner = Column(String(100), nullable=True)
    notes = Column(String(1024), nullable=True)
