from app.database import SessionLocal
from app.models.user import User
from app.models.repository import Repository

from app.database import SessionLocal
from app.models.user import User
from app.models.repository import Repository

if __name__ == "__main__":
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f"  User: {u.id}, Clerk: {u.clerk_user_id}")

        repos = db.query(Repository).all()
        print(f"Total Repos: {len(repos)}")
        for r in repos:
            print(f"  Repo: {r.id}, Name: {r.full_name}, UserID: {r.user_id}")
    finally:
        db.close()