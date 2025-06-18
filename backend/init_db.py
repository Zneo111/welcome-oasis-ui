from database import init_db, db_session
from models.user import User

def setup_database():
    print("Creating database tables...")
    init_db()
    print("Database tables created successfully!")

if __name__ == "__main__":
    setup_database()
