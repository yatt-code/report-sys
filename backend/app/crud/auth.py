from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash, verify_password
from app.schemas.user import UserCreate

def get_user_by_username(db: Session, username: str) -> User:
    """Get a user by username."""
    return db.query(User).filter(User.username == username).first()

def get_user_by_id(db: Session, user_id: int) -> User:
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user."""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        is_superuser=user.is_superuser if hasattr(user, 'is_superuser') else False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> User | None:
    """Authenticate a user."""
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
