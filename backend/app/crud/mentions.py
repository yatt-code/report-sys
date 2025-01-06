# app/crud/mentions.py
from sqlalchemy.orm import Session
from app.models.mention import Mention
from app.schemas.mention import MentionCreate
from typing import Optional
import re

def extract_mentions(text: str) -> list[str]:
    """Extract usernames from text that are mentioned using @."""
    pattern = r'@(\w+)'
    return re.findall(pattern, text)

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