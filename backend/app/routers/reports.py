from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List, Optional, Any

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.core.storage import save_upload_file
from app.crud import reports as reports_crud
from app.models.user import User
from app.schemas.report import (
    ReportCreate,
    ReportUpdate,
    ReportResponse,
    ReportListResponse
)

router = APIRouter()

@router.post("", response_model=ReportResponse)
async def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create a new report."""
    return reports_crud.create_report(db, report, current_user)

@router.get("", response_model=ReportListResponse)
async def get_reports(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get all reports for current user."""
    reports = reports_crud.get_user_reports(db, current_user, skip, limit, search)
    total = reports_crud.get_reports_count(db, current_user, search)
    
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
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get a specific report."""
    report = reports_crud.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this report")
    return report

@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    report: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update a report."""
    db_report = reports_crud.get_report(db, report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    if db_report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this report")
    
    return reports_crud.update_report(db, db_report, report)

@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete a report."""
    db_report = reports_crud.get_report(db, report_id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    if db_report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this report")
    
    reports_crud.delete_report(db, db_report)
    return {"message": "Report deleted"}

@router.post("/upload-inline", response_model=dict)
async def upload_inline_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Upload an inline image for a report."""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_path = save_upload_file(file, folder="inline")
    url = f"/uploads/inline/{file_path.split('/')[-1]}"
    return {"url": url}

@router.post("/{report_id}/attachments", response_model=dict)
async def upload_attachment(
    report_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Upload an attachment for a report."""
    report = reports_crud.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this report")
    
    file_path = save_upload_file(file, folder=str(report_id))
    attachment = reports_crud.create_attachment(
        db, report, file_path, file.filename, file.content_type
    )
    
    return {
        "id": attachment.id,
        "filename": attachment.filename,
        "content_type": attachment.content_type
    }
