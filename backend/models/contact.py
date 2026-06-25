from pydantic import BaseModel
from pydantic import EmailStr
from pydantic import HttpUrl
from datetime import datetime
from pydantic import Field

class ContactCreate(BaseModel):

    user_id: int
    name: str
    company: str
    designation: str
    phone: str
    email: EmailStr
    website: HttpUrl
    address: str
    phone: str = Field(
    min_length=10,
    max_length=15
)


class ContactResponse(BaseModel):

    id: int
    user_id: int
    name: str
    company: str
    designation: str
    phone: str
    email: EmailStr
    website: HttpUrl
    address: str
    created_at: datetime

    class Config:
        from_attributes = True