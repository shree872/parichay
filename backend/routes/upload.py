from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Depends
import uuid
import shutil
from db_models.contact_db import ContactDB

from sqlalchemy.orm import Session
from database.dependencies import get_db

from utils.auth import get_current_user

router = APIRouter(
    tags=["Upload"]
)

@router.post("/scan-card")
async def scan_card(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = f"uploads/{unique_filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_data = {
        "name": "Sreeparna Bal",
        "company": "Figment Global",
        "designation": "ML Engineer",
        "phone": "9999999999",
        "email": "ocr_mock@example.com",
        "website": "www.example.com",
        "address": "Chennai"
    }

    new_contact = ContactDB(
        user_id=current_user,
        name=extracted_data["name"],
        company=extracted_data["company"],
        designation=extracted_data["designation"],
        phone=extracted_data["phone"],
        email=extracted_data["email"],
        website=extracted_data["website"],
        address=extracted_data["address"]
    )

    try:
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)

    except Exception as e:
        db.rollback()

        return {
            "error": str(e)
        }

    return {
        "message": "Card scanned successfully",
        "saved_file": file_path,
        "contact": {
            "name": new_contact.name,
            "email": new_contact.email,
            "company": new_contact.company
        }
    }
