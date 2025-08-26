from sqlalchemy import Column, Integer, String, Boolean, Text, JSON
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

    # NEW: nice-to-haves for UI & future auth binding
    display_name = Column(String(200), nullable=True)  # fallback: first + last
    initials = Column(String(8), nullable=True)  # e.g., 'JD'
    avatar_url = Column(String(512), nullable=True)
    kind = Column(String(16), default="person")  # 'person' | 'team' (later)
    external_ids = Column(JSON, nullable=True)  # {'oidc': 'sub', 'ad': 'sAMAccountName'}
    timezone = Column(String(64), nullable=True)

    controls = relationship("Control", back_populates="owner")
