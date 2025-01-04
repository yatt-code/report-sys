from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AttachmentBase(BaseModel):
    filename: str
    content_type: Optional[str] = None

class AttachmentCreate(AttachmentBase):
    file_path: str
    report_id: int

class AttachmentResponse(AttachmentBase):
    id: int
    file_path: str
    report_id: int
    created_at: datetime

    class Config:
        from_attributes = True
