import os
import shutil
from datetime import datetime
from fastapi import UploadFile
from app.core.config import settings

def get_upload_path() -> str:
    """Get the upload directory path and create it if it doesn't exist."""
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), settings.UPLOAD_FOLDER)
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    return upload_dir

def save_upload_file(upload_file: UploadFile, report_id: int) -> str:
    """Save an uploaded file and return its path."""
    # Create year/month based directory structure
    now = datetime.now()
    relative_path = os.path.join(
        str(now.year),
        f"{now.month:02d}",
        f"{report_id}"
    )
    
    upload_dir = os.path.join(get_upload_path(), relative_path)
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Save the file
    file_path = os.path.join(upload_dir, upload_file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    # Return the relative path from the upload directory
    return os.path.join(relative_path, upload_file.filename)

def delete_upload_file(file_path: str) -> bool:
    """Delete an uploaded file."""
    try:
        full_path = os.path.join(get_upload_path(), file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
            # Try to remove empty parent directories
            dir_path = os.path.dirname(full_path)
            while dir_path != get_upload_path():
                if len(os.listdir(dir_path)) == 0:
                    os.rmdir(dir_path)
                    dir_path = os.path.dirname(dir_path)
                else:
                    break
        return True
    except Exception:
        return False
