from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.schemas.user import UserResponse
from app.crud import users as users_crud

router = APIRouter()

@router.get("/search", response_model=List[UserResponse])
async def search_users(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Search users by username or full name"""
    return users_crud.search_users(db, q) 