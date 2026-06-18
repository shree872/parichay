from sqlalchemy import Column, Integer, String, DateTime
from database.base import Base

class ContactDB(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    website = Column(String)

    address = Column(String)

    created_at = Column(DateTime)
