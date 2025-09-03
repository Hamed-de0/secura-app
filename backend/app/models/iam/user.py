from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, UniqueConstraint, Index, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import Base

class User(Base):
    __tablename__ = "iam_users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    user_name = Column(String(120), nullable=False, unique=True, index=True)  # NEW
    name = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # NEW: optional link into the directory
    person_id = Column(Integer, ForeignKey("persons.id", ondelete="SET NULL"), nullable=True)
    person = relationship("Person", lazy="joined")  # pulls basic person fields if present

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("email", name="uq_user_email"),
        UniqueConstraint("user_name", name="uq_user_username"),
        Index("ix_iam_users_email", "email"),
        Index("ix_iam_users_username", "user_name"),
    )
