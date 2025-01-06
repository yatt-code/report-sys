from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_active_superuser
from app.schemas.user import UserUpdate, UserResponse
from app.crud import users as users_crud

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """List all users (admin only)"""
    return users_crud.get_users(db)

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """Update user (admin only)"""
    return users_crud.update_user(db, user_id, user_update) 