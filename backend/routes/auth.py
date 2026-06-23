from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from datetime import datetime

from database.session import SessionLocal

from models.user import User
from db_models.user_db import UserDB

from utils.auth import hash_password

router = APIRouter()

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register_user(
    user: User,
    db: Session = Depends(get_db)
):

    existing_user = db.query(UserDB).filter(
        UserDB.email == user.email
    ).first()

    if existing_user:
        return {
            "error": "Email already exists"
        }

    hashed_password = hash_password(user.password)

    new_user = UserDB(
        id=user.id,
        email=user.email,
        password=hashed_password,
        created_at=user.created_at
    )

    try:
        db.add(new_user)
        db.commit()

        return {
            "message": "User registered successfully"
        }

    except Exception as e:
        db.rollback()

        return {
            "error": str(e)
        }