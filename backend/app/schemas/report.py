from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from .user import UserResponse
from .attachment import AttachmentResponse

class ReportBase(BaseModel):
    """Base schema for report data"""
    title: str
    content: str

class ReportCreate(ReportBase):
    """Schema for creating a new report"""
    pass

class ReportUpdate(BaseModel):
    """Schema for updating an existing report"""
    title: str
    content: str

class ReportResponse(BaseModel):
    """Schema for report response data"""
    id: int
    user_id: int
    title: str
    content: str
    created_at: datetime
    user: Optional[UserResponse] = None
    attachments: List[AttachmentResponse] = []

    class Config:
        from_attributes = True

class ReportListResponse(BaseModel):
    """Schema for paginated report list response"""
    items: List[ReportResponse]
    total: int
    page: int
    size: int
    pages: int

    class Config:
        from_attributes = True
