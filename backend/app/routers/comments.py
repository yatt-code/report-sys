from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.comment import Comment
from app.models.user import User
from app.models.report import Report
from app.schemas.comments import CommentCreate, CommentResponse, CommentUpdate
from datetime import datetime

router = APIRouter()

@router.post("", response_model=CommentResponse)
async def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new comment."""
    # Verify report exists
    report = db.query(Report).filter(Report.id == comment.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # If parent_id is provided, verify it exists and belongs to the same report
    if comment.parent_id:
        parent = db.query(Comment).filter(Comment.id == comment.parent_id).first()
        if not parent or parent.report_id != comment.report_id:
            raise HTTPException(status_code=400, detail="Invalid parent comment")

    db_comment = Comment(
        content=comment.content,
        report_id=comment.report_id,
        parent_id=comment.parent_id,
        user_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/report/{report_id}", response_model=List[CommentResponse])
async def get_report_comments(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all top-level comments for a report."""
    # Verify report exists and user has access
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    comments = (
        db.query(Comment)
        .filter(Comment.report_id == report_id, Comment.parent_id.is_(None))
        .order_by(Comment.created_at.desc())
        .all()
    )
    return comments

@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a comment."""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if db_comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    db_comment.content = comment.content
    db_comment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a comment and all its replies."""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if db_comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    db.delete(db_comment)  # This will cascade delete all replies
    db.commit()
    
    return {"message": "Comment deleted"}
