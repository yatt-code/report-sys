from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CommentBase(BaseModel):
    content: str
    report_id: int
    parent_id: Optional[int] = None

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    replies: List['CommentResponse'] = []

    class Config:
        orm_mode = True
