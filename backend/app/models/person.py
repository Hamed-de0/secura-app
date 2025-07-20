from sqlalchemy import Column, Integer, String, Boolean, Text
from app.database import Base
from app.config import DB_SCHEMA

class Person(Base):
    __tablename__ = "persons"
    __table_args__ = {"schema": DB_SCHEMA}

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    department = Column(String(100), nullable=True)
    job_title = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    enabled = Column(Boolean, default=True)