from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.core.storage import save_upload_file, delete_upload_file
from app.models.user import User
from app.models.report import Report, Attachment
from app.schemas.report import (
    ReportCreate,
    ReportUpdate,
    Report as ReportSchema,
    ReportWithUser,
    ReportList,
    Attachment as AttachmentSchema
)

router = APIRouter()

@router.post("", response_model=ReportSchema)
async def create_report(
    *,
    db: Session = Depends(get_db),
    title: str = Form(...),
    content: str = Form(...),
    files: List[UploadFile] = File(None),
    current_user: User = Depends(get_current_active_user)
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
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
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

@router.get("/{report_id}", response_model=ReportWithUser)
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

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete a report and its attachments."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Check permissions
    if not current_user.is_superuser and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Delete attachments first
    for attachment in report.attachments:
        delete_upload_file(attachment.file_path)
    
    db.delete(report)  # This will cascade delete attachments
    db.commit()
    
    return {"status": "success", "message": "Report deleted"}

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
