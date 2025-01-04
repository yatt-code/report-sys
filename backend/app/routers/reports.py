from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from pydantic import ValidationError
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import os
import shutil
from datetime import datetime
import json

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.report import Report
from app.models.attachment import Attachment
from app.schemas.report import ReportCreate, ReportUpdate, ReportResponse, ReportListResponse

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def save_upload_file(upload_file: UploadFile, folder: str = "") -> str:
    """Save an uploaded file and return its path."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{upload_file.filename}"
    file_path = os.path.join(UPLOAD_DIR, folder, filename)
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return file_path

@router.post("/upload-inline", response_model=dict)
async def upload_inline_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload an inline image for a report."""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_path = save_upload_file(file, folder="inline")
    url = f"/uploads/inline/{os.path.basename(file_path)}"
    
    return {"url": url}

@router.post("/{report_id}/attachments", response_model=dict)
async def upload_attachment(
    report_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload an attachment for a report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this report")
    
    file_path = save_upload_file(file, folder="attachments")
    
    attachment = Attachment(
        filename=file.filename,
        file_path=file_path,
        content_type=file.content_type,
        report_id=report_id
    )
    
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return {"message": "File uploaded successfully", "attachment_id": attachment.id}

@router.delete("/{report_id}/attachments/{attachment_id}")
async def delete_attachment(
    report_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an attachment from a report."""
    attachment = db.query(Attachment).filter(
        Attachment.id == attachment_id,
        Attachment.report_id == report_id
    ).first()
    
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    report = db.query(Report).filter(Report.id == report_id).first()
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this report")
    
    # Delete the file
    try:
        os.remove(attachment.file_path)
    except OSError:
        pass  # File might already be deleted
    
    # Delete from database
    db.delete(attachment)
    db.commit()
    
    return {"message": "Attachment deleted successfully"}

@router.get("", response_model=ReportListResponse)
async def get_reports(
    skip: int = 0,
    limit: int = 10,
    search: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all reports for the current user."""
    print(f"Getting reports for user {current_user.id} with skip={skip}, limit={limit}, search={search}")
    
    query = db.query(Report).filter(Report.user_id == current_user.id)
    if search:
        query = query.filter(Report.title.ilike(f"%{search}%"))
    
    # Get total before pagination
    total = query.count()
    
    # Add sorting by created_at in descending order (newest first)
    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    
    print(f"Found {len(reports)} reports, total: {total}")
    for report in reports:
        print(f"Report {report.id}: {report.title} (created at {report.created_at})")
    
    return {
        "items": reports,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this report")
    
    return report

@router.post("", response_model=ReportResponse)
async def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new report."""
    print(f"Creating report for user {current_user.id}: {report.title}")
    
    db_report = Report(
        title=report.title,
        content=report.content,
        user_id=current_user.id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    print(f"Created report with ID {db_report.id}")
    return db_report

@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    request: Request,
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a report."""
    try:
        # Get raw request body
        body = await request.json()
        print("Raw request body:", body)
        
        db_report = db.query(Report).filter(Report.id == report_id).first()
        if not db_report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        if db_report.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this report")
        
        # Update fields directly from request body
        if 'title' not in body or 'content' not in body:
            raise HTTPException(status_code=400, detail="Title and content are required")
        
        db_report.title = body['title']
        db_report.content = body['content']
        
        db.commit()
        db.refresh(db_report)
        return db_report
        
    except json.JSONDecodeError as e:
        print("JSON decode error:", str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON data")
    except Exception as e:
        print("Update error:", str(e))
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this report")
    
    # Delete all attachments
    attachments = db.query(Attachment).filter(Attachment.report_id == report_id).all()
    for attachment in attachments:
        try:
            os.remove(attachment.file_path)
        except OSError:
            pass  # File might already be deleted
    
    db.delete(report)
    db.commit()
    
    return {"message": "Report deleted successfully"}
