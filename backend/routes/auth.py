from utils.auth import hash_password
from utils.auth import verify_password
from utils.auth import create_access_token

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException
from database.dependencies import get_db
from database.session import SessionLocal

from models.user import User
from db_models.user_db import UserDB

from utils.auth import hash_password

from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

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

@router.post("/login")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    existing_user = db.query(UserDB).filter(
        UserDB.email == form_data.username
    ).first()

    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    valid_password = verify_password(
        form_data.password,
        existing_user.password
    )

    if not valid_password:

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    access_token = create_access_token(
        data={
            "sub": existing_user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }