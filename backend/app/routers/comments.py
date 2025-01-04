from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.base import Comment as models
from app.schemas.comments import CommentCreate, CommentOut
from app.core.database import get_db

router = APIRouter()

# Create a new comment
@router.post("/", response_model=CommentOut)
def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    new_comment = models.Comment(
        content=comment.content,
        report_id=comment.report_id,
        user_id=comment.user_id,
        parent_id=comment.parent_id,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment


# Fetch all comments for a specific report
@router.get("/{report_id}", response_model=List[CommentOut])
def get_comments(report_id: int, db: Session = Depends(get_db)):
    comments = db.query(models.Comment).filter(models.Comment.report_id == report_id).all()
    return comments


# Update a comment
@router.put("/{comment_id}", response_model=CommentOut)
def update_comment(comment_id: int, comment: CommentCreate, db: Session = Depends(get_db)):
    existing_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not existing_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    existing_comment.content = comment.content
    db.commit()
    db.refresh(existing_comment)
    return existing_comment


# Delete a comment
@router.delete("/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(comment)
    db.commit()
    return {"detail": "Comment deleted successfully"}
