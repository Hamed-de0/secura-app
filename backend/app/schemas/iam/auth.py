from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, model_validator

# --- Person lite for profile merge ---
class PersonLiteOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    display_name: Optional[str] = None
    initials: Optional[str] = None
    timezone: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: EmailStr
    user_name: str
    name: Optional[str] = None
    password: str
    person_id: Optional[int] = None   # NEW: allow linking at registration

class UserOut(BaseModel):
    id: int
    email: EmailStr
    user_name: str
    name: Optional[str] = None
    is_active: bool
    person_id: Optional[int] = None   # NEW
    model_config = ConfigDict(from_attributes=True)

class LoginIn(BaseModel):
    email: Optional[EmailStr] = None
    user_name: Optional[str] = None
    password: str

    @model_validator(mode="after")
    def _one_identifier(self):
        if not (self.email or self.user_name):
            raise ValueError("Provide either email or user_name.")
        return self

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeOut(BaseModel):
    user: UserOut
    person: Optional[PersonLiteOut] = None   # NEW: enrich with directory profile
    permissions: List[dict] = []
