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

from models.user import UserRegister
from db_models.user_db import UserDB

from utils.auth import hash_password

from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register")
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(UserDB).filter(
        UserDB.email == user.email
    ).first()

    if existing_user:
     raise HTTPException(
        status_code=400,
        detail="Email already exists"
    )

    hashed_password = hash_password(user.password)
    print("HASHED PASSWORD:", hashed_password)

    new_user = UserDB(
    email=user.email,
    password=hashed_password
    )

    try:
        db.add(new_user)
        db.commit()

        return {
            "message": "User registered successfully"
        }

    except Exception as e:

     db.rollback()

    raise HTTPException(
        status_code=500,
        detail=str(e)
    )

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
    print("USERNAME:", form_data.username)
    print("PASSWORD:", form_data.password)
    print("DB HASH:", existing_user.password)

    valid_password = verify_password(
        form_data.password,
        existing_user.password
    )
    print("VALID PASSWORD:", valid_password)

    if not valid_password:

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    access_token = create_access_token(
        data={
    "sub": str(existing_user.id)
}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }