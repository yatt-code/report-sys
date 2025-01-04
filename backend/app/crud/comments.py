from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.models.comment import Comment
from app.schemas.comments import CommentCreate, CommentUpdate
from app.models.user import User

def create_comment(db: Session, comment: CommentCreate, current_user: User) -> Comment:
    """Create a new comment."""
    db_comment = Comment(
        content=comment.content,
        report_id=comment.report_id,
        user_id=current_user.id,
        parent_id=comment.parent_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_comment(db: Session, comment_id: int) -> Optional[Comment]:
    """Get a comment by ID."""
    return db.query(Comment).filter(Comment.id == comment_id).first()

def get_report_comments(db: Session, report_id: int, skip: int = 0, limit: int = 50) -> List[Comment]:
    """Get all top-level comments for a report."""
    return (
        db.query(Comment)
        .filter(Comment.report_id == report_id, Comment.parent_id.is_(None))
        .offset(skip)
        .limit(limit)
        .all()
    )

def update_comment(db: Session, db_comment: Comment, comment: CommentUpdate) -> Comment:
    """Update a comment."""
    for field, value in comment.dict(exclude_unset=True).items():
        setattr(db_comment, field, value)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, db_comment: Comment) -> None:
    """Delete a comment."""
    db.delete(db_comment)
    db.commit()
