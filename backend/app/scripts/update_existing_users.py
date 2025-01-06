import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import DictCursor

load_dotenv()

def update_existing_users():
    # Get database URL from environment
    DATABASE_URL = os.getenv('SQLALCHEMY_DATABASE_URI')
    
    try:
        print("Starting user update process...")
        
        # Connect directly to database
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Update users
        cur.execute("""
            UPDATE users 
            SET full_name = username || ' bin/binti User',
                role = 'analyst'
            WHERE full_name IS NULL 
               OR role IS NULL
            RETURNING id, username, full_name, role;
        """)
        
        updated_users = cur.fetchall()
        print(f"Found and updated {len(updated_users)} users")
        
        for user in updated_users:
            print(f"Updated user: {user['username']}")
            print(f"  - full_name: {user['full_name']}")
            print(f"  - role: {user['role']}")
        
        conn.commit()
        print("Update completed successfully!")
        
    except Exception as e:
        print(f"Error updating users: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    update_existing_users() 