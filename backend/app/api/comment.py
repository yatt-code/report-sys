from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.comment import Comment as CommentModel
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from datetime import datetime

router = APIRouter()

# Create a comment
@router.post("", response_model=CommentResponse)
def create_comment(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    content: str = Form(...),
    report_id: int = Form(...),
    parent_id: Optional[int] = Form(None)
) -> Any:
    """Create a new comment."""
    comment = CommentModel(
        content=content,
        report_id=report_id,
        parent_id=parent_id,
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

# Get all comments for a report, including nested replies
@router.get("/{report_id}", response_model=List[CommentResponse])
def get_comments(
    report_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """Get all comments for a report."""
    comments = (
        db.query(CommentModel)
        .filter(CommentModel.report_id == report_id, CommentModel.parent_id == None)
        .all()
    )

    def serialize_comment(comment):
        return {
            "id": comment.id,
            "content": comment.content,
            "user_id": comment.user_id,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "replies": [
                serialize_comment(reply) for reply in comment.replies
            ],
        }

    return [serialize_comment(comment) for comment in comments]

# Update a comment
@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(
    *,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    content: str = Form(...)
) -> Any:
    """Update a comment."""
    comment = db.query(CommentModel).filter(CommentModel.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    comment.content = content
    comment.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(comment)
    return comment

# Delete a comment
@router.delete("/{comment_id}", response_model=dict)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """Delete a comment."""
    comment = db.query(CommentModel).filter(CommentModel.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db.delete(comment)
    db.commit()
    return {"status": "success", "message": "Comment deleted successfully"}
