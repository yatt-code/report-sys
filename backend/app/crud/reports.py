from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.models.report import Report
from app.models.user import User
from app.models.attachment import Attachment
from app.schemas.report import ReportCreate, ReportUpdate
from app.core.storage import save_upload_file, delete_upload_file

def create_report(db: Session, report: ReportCreate, user: User) -> Report:
    """Create a new report."""
    db_report = Report(
        title=report.title,
        content=report.content,
        user_id=user.id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_report(db: Session, report_id: int) -> Optional[Report]:
    """Get a specific report by ID."""
    return db.query(Report).filter(Report.id == report_id).first()

def get_user_reports(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None
) -> List[Report]:
    """Get all reports for a user with pagination and search."""
    query = db.query(Report).filter(Report.user_id == user.id)
    
    if search:
        query = query.filter(Report.title.ilike(f"%{search}%"))
    
    return query.order_by(desc(Report.created_at)).offset(skip).limit(limit).all()

def get_reports_count(db: Session, user: User, search: Optional[str] = None) -> int:
    """Get total count of user's reports."""
    query = db.query(Report).filter(Report.user_id == user.id)
    if search:
        query = query.filter(Report.title.ilike(f"%{search}%"))
    return query.count()

def update_report(
    db: Session,
    db_report: Report,
    report_update: ReportUpdate
) -> Report:
    """Update a report."""
    for field, value in report_update.dict(exclude_unset=True).items():
        setattr(db_report, field, value)
    db.commit()
    db.refresh(db_report)
    return db_report

def delete_report(db: Session, db_report: Report) -> None:
    """Delete a report and its attachments."""
    # Delete all attachments first
    for attachment in db_report.attachments:
        delete_upload_file(attachment.file_path)
    db.delete(db_report)
    db.commit()

def create_attachment(
    db: Session,
    report: Report,
    file_path: str,
    filename: str,
    content_type: str
) -> Attachment:
    """Create a new attachment for a report."""
    attachment = Attachment(
        filename=filename,
        file_path=file_path,
        content_type=content_type,
        report_id=report.id
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment

def delete_attachment(db: Session, attachment: Attachment) -> None:
    """Delete an attachment."""
    delete_upload_file(attachment.file_path)
    db.delete(attachment)
    db.commit()
