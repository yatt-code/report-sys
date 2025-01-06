# app/crud/mentions.py
from sqlalchemy.orm import Session
from app.models.base import Mention, User
from app.schemas.mention import MentionCreate
from typing import Optional, List
import re

def extract_mentions(text: str) -> list[str]:
    """Extract usernames from text that are mentioned using @."""
    pattern = r'@([\w.-]+)(?:\s|$|[.,!?])'
    matches = re.findall(pattern, text)
    return list(dict.fromkeys(matches))

def create_mentions(
    db: Session,
    usernames: list[str],
    report_id: Optional[int] = None,
    comment_id: Optional[int] = None
) -> list[Mention]:
    from app.crud.user import get_user_by_username  # Import here to avoid circular imports
    
    mentions = []
    for username in usernames:
        user = get_user_by_username(db, username)
        if user:
            mention = Mention(
                user_id=user.id,
                report_id=report_id,
                comment_id=comment_id
            )
            db.add(mention)
            mentions.append(mention)
    
    db.commit()
    return mentions

def get_mentions_for_entity(
    db: Session,
    report_id: Optional[int] = None,
    comment_id: Optional[int] = None
) -> List[Mention]:
    query = db.query(Mention)
    if report_id:
        query = query.filter(Mention.report_id == report_id)
    if comment_id:
        query = query.filter(Mention.comment_id == comment_id)
    return query.all()