from pydantic import BaseModel
from pydantic import EmailStr


class ContactCreate(BaseModel):

    name: str

    company: str

    designation: str

    phone: str

    email: EmailStr

    website: str

    address: str


class ContactResponse(ContactCreate):

    id: int

    class Config:

        from_attributes = True