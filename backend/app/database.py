from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import DATABASE_URL
from fastapi import Query
from typing import Optional
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_common_params(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    fields: Optional[str] = None  # e.g., "id,name"
):
    return {"offset": offset, "limit": limit, "fields": fields}