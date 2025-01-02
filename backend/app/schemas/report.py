from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.auth import User

class AttachmentBase(BaseModel):
    filename: str
    content_type: str

class AttachmentCreate(AttachmentBase):
    pass

class Attachment(AttachmentBase):
    id: int
    report_id: int
    file_path: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None

class Report(ReportBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    attachments: List[Attachment] = []

    class Config:
        from_attributes = True

class ReportWithUser(Report):
    user: User

    class Config:
        from_attributes = True

class ReportList(BaseModel):
    total: int
    items: List[ReportWithUser]

    class Config:
        from_attributes = True
