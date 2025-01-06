from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, MetaData
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # Relationships
    reports = relationship("Report", back_populates="user", cascade="all, delete")
    comments = relationship("Comment", back_populates="user", cascade="all, delete")
    mentions = relationship("Mention", back_populates="user", cascade="all, delete")
    projects = relationship("UserProject", back_populates="user", cascade="all, delete")

class UserProject(Base):
    __tablename__ = "user_projects"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    project = Column(String, nullable=False)

    # Relationship
    user = relationship("User", back_populates="projects")

class Report(Base):
    __tablename__ = "reports"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="reports")
    comments = relationship("Comment", back_populates="report", cascade="all, delete")
    attachments = relationship("Attachment", back_populates="report", cascade="all, delete")
    mentions = relationship("Mention", back_populates="report", cascade="all, delete")

class Comment(Base):
    __tablename__ = "comments"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"))
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="comments")
    report = relationship("Report", back_populates="comments")
    replies = relationship(
        "Comment",
        backref=backref('parent', remote_side=[id]),
        cascade="all, delete-orphan"
    )
    mentions = relationship("Mention", back_populates="comment", cascade="all, delete")

class Attachment(Base):
    __tablename__ = "attachments"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    report = relationship("Report", back_populates="attachments")

class Mention(Base):
    __tablename__ = "mentions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=True)
    comment_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="mentions")
    report = relationship("Report", back_populates="mentions")
    comment = relationship("Comment", back_populates="mentions")
