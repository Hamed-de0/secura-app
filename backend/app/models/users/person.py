from sqlalchemy import Column, Integer, String, Boolean, Text
from app.core.base import BaseModel
from sqlalchemy.orm import relationship

class Person(BaseModel):
    __tablename__ = "persons"

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    department = Column(String(100), nullable=True)
    job_title = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    enabled = Column(Boolean, default=True)

    controls = relationship("Control", back_populates="owner")
