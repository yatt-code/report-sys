from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any

from app.core.database import get_db
from app.core.auth import (
    create_access_token,
    get_current_active_user
)
from app.crud import auth as auth_crud
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """Register a new user."""
    if auth_crud.get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    return auth_crud.create_user(db, user)

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """OAuth2 compatible token login."""
    user = auth_crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get current user."""
    return current_user
