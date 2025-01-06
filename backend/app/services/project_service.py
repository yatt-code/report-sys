from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.base import User, UserProject, UserRole, Project

def can_manage_projects(user: User) -> bool:
    return user.is_superuser or user.role in [UserRole.DIRECTOR, UserRole.MANAGER]

def assign_projects(db: Session, user_id: int, projects: List[Project], assigner: User):
    if not can_manage_projects(assigner):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to assign projects"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Directors and Admins automatically have access to all projects
    if user.role in [UserRole.DIRECTOR] or user.is_superuser:
        user.projects = list(Project)
    else:
        user.projects = projects

    db.commit()
    return user 