from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from sqlalchemy import desc
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.core.storage import save_upload_file, delete_upload_file
from app.models.base import User, Report, Attachment  # Updated imports
from app.schemas.report import (
    ReportCreate,
    ReportUpdate,
    Report as ReportSchema,
    ReportList
)
from app.schemas.attachment import Attachment as AttachmentSchema
import os
from datetime import datetime

router = APIRouter()

@router.post("", response_model=ReportSchema)
async def create_report(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    title: str = Form(...),
    content: str = Form(...),
    files: List[UploadFile] = File([])
) -> Any:
    """Create a new report with optional file attachments."""
    report = Report(
        title=title,
        content=content,
        user_id=current_user.id
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Handle file uploads
    if files:
        for file in files:
            if file.filename:
                file_path = save_upload_file(file, report.id)
                attachment = Attachment(
                    filename=file.filename,
                    file_path=file_path,
                    content_type=file.content_type,
                    report_id=report.id
                )
                db.add(attachment)
        db.commit()
        db.refresh(report)

    return report

@router.get("", response_model=ReportList)
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None
) -> Any:
    """List reports with pagination and optional search."""
    query = db.query(Report)
    
    # If not superuser, only show own reports
    if not current_user.is_superuser:
        query = query.filter(Report.user_id == current_user.id)
    
    # Apply search filter if provided
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Report.title.ilike(search_filter)) |
            (Report.content.ilike(search_filter))
        )
    
    total = query.count()
    items = (
        query
        .order_by(desc(Report.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return {"total": total, "items": items}

@router.get("/{report_id}", response_model=ReportSchema)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get a specific report by ID."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Check permissions
    if not current_user.is_superuser and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return report

@router.put("/{report_id}", response_model=ReportSchema)
async def update_report(
    *,
    report_id: int,
    db: Session = Depends(get_db),
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    files: List[UploadFile] = File(None),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update a report and optionally add new attachments."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Check permissions
    if not current_user.is_superuser and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Update fields if provided
    if title is not None:
        report.title = title
    if content is not None:
        report.content = content
    
    # Handle new file uploads
    if files:
        for file in files:
            if file.filename:
                file_path = save_upload_file(file, report.id)
                attachment = Attachment(
                    filename=file.filename,
                    file_path=file_path,
                    content_type=file.content_type,
                    report_id=report.id
                )
                db.add(attachment)
    
    db.commit()
    db.refresh(report)
    return report

@router.delete("/{report_id}", response_model=dict)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Delete a report.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # First delete all attachments
    db.query(Attachment).filter(Attachment.report_id == report_id).delete()
    
    # Then delete the report
    db.delete(report)
    db.commit()
    
    return {"status": "success", "message": "Report deleted successfully"}

@router.delete("/{report_id}/attachments/{attachment_id}")
def delete_attachment(
    report_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete a specific attachment from a report."""
    attachment = (
        db.query(Attachment)
        .join(Report)
        .filter(Attachment.id == attachment_id, Report.id == report_id)
        .first()
    )
    
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    # Check permissions
    if not current_user.is_superuser and attachment.report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Delete the file
    delete_upload_file(attachment.file_path)
    
    # Delete the database record
    db.delete(attachment)
    db.commit()
    
    return {"status": "success", "message": "Attachment deleted"}

@router.post("/upload-inline")
async def upload_inline_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Upload an inline image for markdown content."""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save the file
    file_path = save_upload_file(file)
    
    # Return the URL that can be used in markdown
    file_url = f"{settings.API_URL}/uploads/{file_path}"
    return {
        "url": file_url,
        "alt": file.filename
    }
