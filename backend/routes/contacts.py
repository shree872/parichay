from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.contact import ContactCreate
from models.contact import ContactResponse

from database.session import SessionLocal
from db_models.contact_db import ContactDB
from database.dependencies import get_db

from utils.auth import get_current_user

router = APIRouter()

@router.get("/contacts")
def get_contacts(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    contacts = db.query(ContactDB).all()
    return contacts


@router.post("/contacts")
def create_contact(
    contact: ContactCreate,
    db: Session = Depends(get_db)
):
    new_contact = ContactDB(
        user_id=contact.user_id,
        name=contact.name,
        company=contact.company,
        designation=contact.designation,
        phone=contact.phone,
        email=contact.email,
        website=contact.website,
        address=contact.address,
        created_at=datetime.utcnow()
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
    updated_contact: ContactCreate,
    db: Session = Depends(get_db)
):
    contact = db.query(ContactDB).filter(
        ContactDB.id == contact_id
    ).first()

    if not contact:
        raise HTTPException(
    status_code=404,
    detail="Contact not found"
)

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