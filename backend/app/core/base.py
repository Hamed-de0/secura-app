# app/core/base.py
import uuid
from sqlalchemy import Column, DateTime, Integer, Boolean
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class BaseMain(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True)
    enabled = Column(Boolean, default=True)


class BaseModel(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    enabled = Column(Boolean, default=True)