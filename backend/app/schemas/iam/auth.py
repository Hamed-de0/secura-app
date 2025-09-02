from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict

class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeOut(BaseModel):
    user: UserOut
    permissions: List[dict] = []
