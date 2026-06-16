from pydantic import BaseModel
from datetime import datetime

class Contact(BaseModel):
    id: int
    user_id: int
    name: str
    company: str
    designation: str
    phone: str
    email: str
    website: str
    address: str
    created_at: datetime