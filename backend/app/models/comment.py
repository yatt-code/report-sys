from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True) #nested comments
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    replies = relationship("Comment", backref="parent", remote_side=[id])
