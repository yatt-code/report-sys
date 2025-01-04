from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import User
from app.core.auth import get_password_hash

def create_test_user():
    db = SessionLocal()
    try:
        # Check if test user already exists
        user = db.query(User).filter(User.email == "test@example.com").first()
        if user:
            print("Test user already exists")
            return

        # Create test user
        test_user = User(
            email="test@example.com",
            username="testuser",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            is_superuser=False
        )
        db.add(test_user)
        db.commit()
        print("Test user created successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
