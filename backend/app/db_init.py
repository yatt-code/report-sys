from sqlalchemy.orm import Session
from app.models.base import User, Report
from app.core.database import SessionLocal

def init_db():
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database tables recreated successfully!")
