from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any
from datetime import timedelta

from app.core.database import get_db
from app.core.auth import (
    create_access_token,
    get_current_active_user
)
from app.core.security import create_access_token, authenticate_user
from app.core.config import settings
from app.crud import auth as auth_crud
from app.models.base import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(
    *,
    db: Session = Depends(get_db),
    user: UserCreate,
) -> Any:
    """
    Create new user.
    """
    if auth_crud.get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    if auth_crud.get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    db_user = auth_crud.create_user(db, user)
    return db_user


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """OAuth2 compatible token login, get an access token for future requests."""
    print(f"Login attempt for user: {form_data.username}")  # Add debug logging
    
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        user_id=user.id,
        expires_delta=access_token_expires
    )
    
    print(f"Login successful for user: {user.email}")  # Add debug logging
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get current user."""
    return current_user


