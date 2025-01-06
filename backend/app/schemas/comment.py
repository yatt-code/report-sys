from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class CommentBase(BaseModel):
    content: str
    report_id: int
    parent_id: Optional[int] = None

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    content: str

class CommentResponse(CommentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    replies: List['CommentResponse'] = []

    class Config:
        from_attributes = True

# This is needed for the recursive type reference in replies
CommentResponse.model_rebuild() 