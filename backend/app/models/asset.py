from sqlalchemy import Column, Integer, String, Text
from ..database import Base
from ..config import DB_SCHEMA

class Asset(Base):
    __tablename__ = "assets"
    __table_args__ = {"schema": DB_SCHEMA}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(100))
    location = Column(String(255))
    owner = Column(String(100))
    criticality = Column(String(50))
    notes = Column(Text)
