from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.user import UserBase

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    report_id: int
    parent_id: Optional[int] = None

class CommentUpdate(CommentBase):
    pass

# Forward reference for nested comments
class CommentResponse(CommentBase):
    id: int
    report_id: int
    user_id: int
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    user: UserBase
    replies: List['CommentResponse'] = []

    class Config:
        orm_mode = True

# This is needed to resolve the forward reference
CommentResponse.update_forward_refs()
