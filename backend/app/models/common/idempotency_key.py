# app/models/common/idempotency_key.py
from app.core.base import Base
from sqlalchemy import Column, String, DateTime, Text
from datetime import datetime

class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    key = Column(String(80), primary_key=True)
    request_hash = Column(String(64), nullable=False)
    response_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
