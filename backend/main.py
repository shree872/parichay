from fastapi import FastAPI
from models.contact import Contact
from datetime import datetime
from fastapi import Depends

from sqlalchemy.orm import Session
from database.session import SessionLocal
from db_models.contact_db import ContactDB

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Parichay Backend Running"}

@app.get("/sample-contact")
def sample_contact():

    contact = Contact(
        id=1,
        user_id=1,
        name="John Doe",
        company="Google",
        designation="Manager",
        phone="9876543210",
        email="john@gmail.com",
        website="www.google.com",
        address="Mumbai",
        created_at=datetime.now()
    )

    return contact

@app.get("/contacts")
def get_contacts(
    db: Session = Depends(get_db)
):
    contacts = db.query(ContactDB).all()
    return contacts

@app.post("/contacts")
def create_contact(
    contact: Contact,
    db: Session = Depends(get_db)
):
    new_contact = ContactDB(
        id=contact.id,
        user_id=contact.user_id,
        name=contact.name,
        company=contact.company,
        designation=contact.designation,
        phone=contact.phone,
        email=contact.email,
        website=contact.website,
        address=contact.address,
        created_at=contact.created_at
    )

    db.add(new_contact)
    db.commit()

    return {
        "message": "Contact stored in PostgreSQL"
    }
