from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.crud import comments as comments_crud
from app.crud import mentions as mentions_crud
from app.models.base import User
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse

router = APIRouter()

@router.post("", response_model=CommentResponse)
async def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create a new comment."""
    db_comment = comments_crud.create_comment(db, comment, current_user)

    # Handle Mentions
    mentioned_users = mentions_crud.extract_mentions(comment.content)
    if mentioned_users:
        mentions_crud.create_mentions(db, mentioned_users, comment_id=db_comment.id)
    
    return db_comment

@router.get("/report/{report_id}", response_model=List[CommentResponse])
async def get_report_comments(
    report_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get all comments for a report."""
    return comments_crud.get_report_comments(db, report_id, skip, limit)

@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update a comment."""
    db_comment = comments_crud.get_comment(db, comment_id)
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if db_comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    updated_comment = comments_crud.update_comment(db, db_comment, comment)
    
    # Handle Mentions for updated content
    mentioned_users = mentions_crud.extract_mentions(comment.content)
    if mentioned_users:
        mentions_crud.create_mentions(db, mentioned_users, comment_id=comment_id)
    
    return updated_comment

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete a comment."""
    db_comment = comments_crud.get_comment(db, comment_id)
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if db_comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    comments_crud.delete_comment(db, db_comment)
    return {"message": "Comment deleted"}