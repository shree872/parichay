from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.storage import save_upload
from app.crud.crud_connection import connection as crud_connection
from app.crud.crud_profile import profile as crud_profile
from app.db.session import get_db
from app.models.user import User
from app.schemas.connection import (
    ConnectionCreateFromProfile,
    ConnectionCreateFromScan,
    ConnectionCreateManual,
    ConnectionRead,
    ConnectionUpdate,
    ScanExtractResult,
)
from app.services.ocr import extract_card_fields

router = APIRouter()


@router.get("", response_model=list[ConnectionRead])
def list_connections(
    search: str | None = None,
    tag: str | None = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ConnectionRead]:
    return crud_connection.list_for_owner(
        db, owner_id=current_user.id, search=search, tag=tag, skip=skip, limit=limit
    )


@router.post("/manual", response_model=ConnectionRead, status_code=status.HTTP_201_CREATED)
def create_manual_connection(
    payload: ConnectionCreateManual,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConnectionRead:
    return crud_connection.create_manual(db, owner_id=current_user.id, data=payload.model_dump())


@router.post("/from-profile", response_model=ConnectionRead, status_code=status.HTTP_201_CREATED)
def save_from_qr(
    payload: ConnectionCreateFromProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConnectionRead:
    """Called right after scanning another Parichay user's QR code."""
    source_profile = crud_profile.get_by_slug(db, slug=payload.slug)
    if not source_profile or not source_profile.is_public:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    if source_profile.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You can't save your own card"
        )
    return crud_connection.create_from_profile(
        db,
        owner_id=current_user.id,
        source_profile=source_profile,
        notes=payload.notes,
        tags=payload.tags,
    )


@router.post("/scan", response_model=ScanExtractResult)
def scan_physical_card(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
) -> ScanExtractResult:
    """
    Step 1 of the AI card scanner: upload a photo, get back OCR-extracted
    fields for the user to review/edit. Nothing is saved to the contacts
    list yet - the client calls POST /connections/from-scan to confirm.
    """
    public_url, raw_bytes = save_upload(file, subfolder="scans")
    extracted = extract_card_fields(raw_bytes)

    return ScanExtractResult(
        raw_image_url=public_url,
        full_name=extracted.full_name,
        title=extracted.title,
        company=extracted.company,
        email=extracted.email,
        phone=extracted.phone,
        website=extracted.website,
        raw_text=extracted.raw_text,
    )


@router.post("/from-scan", response_model=ConnectionRead, status_code=status.HTTP_201_CREATED)
def confirm_scanned_connection(
    payload: ConnectionCreateFromScan,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConnectionRead:
    """Step 2: user reviewed/edited the OCR result and confirms save."""
    return crud_connection.create_from_scan(db, owner_id=current_user.id, data=payload.model_dump())


@router.get("/{connection_id}", response_model=ConnectionRead)
def get_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConnectionRead:
    db_obj = crud_connection.get(db, id=connection_id)
    if not db_obj or db_obj.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connection not found")
    return db_obj


@router.patch("/{connection_id}", response_model=ConnectionRead)
def update_connection(
    connection_id: int,
    payload: ConnectionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConnectionRead:
    db_obj = crud_connection.get(db, id=connection_id)
    if not db_obj or db_obj.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connection not found")
    return crud_connection.update(
        db, db_obj=db_obj, obj_in=payload.model_dump(exclude_unset=True)
    )


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    db_obj = crud_connection.get(db, id=connection_id)
    if not db_obj or db_obj.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connection not found")
    crud_connection.remove(db, db_obj=db_obj)
