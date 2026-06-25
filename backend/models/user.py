from pydantic import BaseModel
from pydantic import EmailStr
from datetime import datetime


class User(BaseModel):

    id: int
    email: EmailStr
    password: str
    created_at: datetime