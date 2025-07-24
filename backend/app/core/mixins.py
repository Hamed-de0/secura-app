# app/core/mixins.py
from sqlalchemy import Column, String, Boolean, DateTime, Integer
from datetime import datetime

class NameDescriptionMixin:
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)

class SoftDeleteMixin:
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)

class OwnerMixin:
    owner_id = Column(Integer, nullable=True)