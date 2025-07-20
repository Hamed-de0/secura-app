from pydantic import BaseModel, EmailStr
from typing import Optional

class PersonBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    enabled: Optional[bool] = True

class PersonCreate(PersonBase):
    pass

class PersonUpdate(PersonBase):
    pass

class PersonRead(PersonBase):
    id: int

    class Config:
        from_attributes = True