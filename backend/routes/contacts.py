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

@router.put("/contacts/{contact_id}")
def update_contact(
    contact_id: int,
    updated_contact: Contact,
    db: Session = Depends(get_db)
):
    contact = db.query(ContactDB).filter(
        ContactDB.id == contact_id
    ).first()

    if not contact:
        return {
            "error": "Contact not found"
        }

    try:
        contact.user_id = updated_contact.user_id
        contact.name = updated_contact.name
        contact.company = updated_contact.company
        contact.designation = updated_contact.designation
        contact.phone = updated_contact.phone
        contact.email = updated_contact.email
        contact.website = updated_contact.website
        contact.address = updated_contact.address
        contact.created_at = updated_contact.created_at

        db.commit()
        db.refresh(contact)

        return {
            "message": "Contact updated successfully"
        }

    except Exception as e:
        db.rollback()

        return {
            "error": str(e)
        }

@router.delete("/contacts/{contact_id}")
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db)
):
    contact = db.query(ContactDB).filter(
        ContactDB.id == contact_id
    ).first()

    if not contact:
        return {
            "error": "Contact not found"
        }

    try:
        db.delete(contact)
        db.commit()

        return {
            "message": "Contact deleted successfully"
        }

    except Exception as e:
        db.rollback()

        return {
            "error": str(e)
        }