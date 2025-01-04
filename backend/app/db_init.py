from app.core.database import engine, Base
from app.models.user import User
from app.models.report import Report
from app.models.attachment import Attachment

def init_db():
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database tables recreated successfully!")
