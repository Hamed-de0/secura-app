from typing import Optional, List
from pydantic import BaseModel, ConfigDict, model_validator

class RoleCreate(BaseModel):
    key: str
    title: str

class RoleOut(BaseModel):
    id: int
    key: str
    title: str
    model_config = ConfigDict(from_attributes=True)

class PermissionCreate(BaseModel):
    action: str
    resource: str

class PermissionOut(BaseModel):
    id: int
    action: str
    resource: str
    model_config = ConfigDict(from_attributes=True)

class RolePermissionCreate(BaseModel):
    role_id: int
    permission_id: int

class UserRoleBindingCreate(BaseModel):
    user_id: str
    role_id: int
    scope_type: str
    scope_id: int

class UserRoleBindingOut(BaseModel):
    id: int
    user_id: str
    role_id: int
    scope_type: str
    scope_id: int
    model_config = ConfigDict(from_attributes=True)

class EffectivePermission(BaseModel):
    action: str
    resource: str
