from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.contact import Contact
from database.session import SessionLocal
from db_models.contact_db import ContactDB

router = APIRouter()

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/contacts")
def get_contacts(
    db: Session = Depends(get_db)
):
    contacts = db.query(ContactDB).all()
    return contacts


@router.post("/contacts")
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

    try:
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)

        return {
            "message": "Contact stored in PostgreSQL"
        }

    except Exception as e:
        db.rollback()

        return {
            "error": str(e)
        }