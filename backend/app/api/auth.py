from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_active_user,
)
from app.core.database import get_db
from app.core.config import settings
from app.schemas.auth import User, UserCreate, Token, UserUpdate
from app.models.user import User as UserModel

router = APIRouter()

@router.post("/register", response_model=User)
def register(*, db: Session = Depends(get_db), user_in: UserCreate) -> Any:
    """
    Register a new user.
    """
    user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists.",
        )
    
    user = db.query(UserModel).filter(UserModel.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this username already exists.",
        )
    
    user = UserModel(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(UserModel).filter(UserModel.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
def read_current_user(current_user: UserModel = Depends(get_current_active_user)) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=User)
def update_current_user(
    *,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
    user_in: UserUpdate,
) -> Any:
    """
    Update current user.
    """
    if user_in.password is not None:
        current_user.hashed_password = get_password_hash(user_in.password)
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
