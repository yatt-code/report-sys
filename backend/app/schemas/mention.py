from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .user import UserResponse

class MentionBase(BaseModel):
    user_id: int
    report_id: Optional[int] = None
    comment_id: Optional[int] = None

class MentionCreate(MentionBase):
    pass

class MentionResponse(MentionBase):
    id: int
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True