from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.base import UserProject

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    full_name: str
    role: str = "analyst"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None

class UserResponse(UserBase):
    id: int
    full_name: str
    role: str
    is_active: bool
    is_superuser: bool
    projects: List[str] = []

    class Config:
        from_attributes = True
