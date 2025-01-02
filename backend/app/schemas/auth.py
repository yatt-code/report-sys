from typing import Optional
from pydantic import BaseModel, EmailStr, constr

class UserBase(BaseModel):
    email: EmailStr
    username: constr(min_length=3, max_length=50)
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: constr(min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str  # user email
    exp: int  # expiration time

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True
