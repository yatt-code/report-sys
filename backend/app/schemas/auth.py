from typing import Optional, List
from pydantic import BaseModel, EmailStr, constr, validator
from app.models.enums import UserRole, Project

class UserBase(BaseModel):
    email: EmailStr
    username: constr(min_length=3, max_length=50)
    full_name: constr(max_length=255)
    role: UserRole = UserRole.ANALYST

    @validator('full_name')
    def validate_full_name(cls, v):
        name_markers = ['bin', 'binti', 'a/l', 'a/p']
        if not any(marker in v.lower() for marker in name_markers):
            raise ValueError(
                'Full name must contain one of the following: "bin", "binti", "a/l", or "a/p"'
            )
        return v

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    role: UserRole = UserRole.ANALYST  # Default role for new users

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    projects: Optional[List[Project]] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    projects: List[Project] = []

    class Config:
        from_attributes = True
