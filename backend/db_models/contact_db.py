from sqlalchemy import Column, Integer, String, DateTime
from database.base import Base

class ContactDB(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)

    name = Column(String)
    company = Column(String)
    designation = Column(String)

    phone = Column(String)
    email = Column(String)
    website = Column(String)

    address = Column(String)

    created_at = Column(DateTime)