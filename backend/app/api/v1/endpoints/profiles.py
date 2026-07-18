from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.storage import save_upload
from app.crud.crud_profile import profile as crud_profile
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileRead, ProfileUpdate, PublicProfileRead

router = APIRouter()


def _with_qr_payload(profile_obj) -> ProfileRead:
    data = ProfileRead.model_validate(profile_obj)
    data.qr_payload = f"{settings.PUBLIC_APP_BASE_URL}/c/{profile_obj.slug}"
    return data


@router.get("/me", response_model=ProfileRead)
def get_my_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ProfileRead:
    profile_obj = crud_profile.get_by_user_id(db, user_id=current_user.id)
    if not profile_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No card yet. Create one with POST /profiles/me",
        )
    return _with_qr_payload(profile_obj)


@router.post("/me", response_model=ProfileRead, status_code=status.HTTP_201_CREATED)
def create_my_profile(
    payload: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileRead:
    if crud_profile.get_by_user_id(db, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Card already exists. Use PUT /profiles/me to update it.",
        )
    profile_obj = crud_profile.create_for_user(db, user_id=current_user.id, obj_in=payload)
    return _with_qr_payload(profile_obj)


@router.put("/me", response_model=ProfileRead)
def update_my_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileRead:
    profile_obj = crud_profile.get_by_user_id(db, user_id=current_user.id)
    if not profile_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No card yet")
    profile_obj = crud_profile.update(db, db_obj=profile_obj, obj_in=payload)
    return _with_qr_payload(profile_obj)


@router.post("/me/avatar", response_model=ProfileRead)
def upload_my_avatar(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileRead:
    profile_obj = crud_profile.get_by_user_id(db, user_id=current_user.id)
    if not profile_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No card yet")

    public_url, _ = save_upload(file, subfolder="avatars")
    profile_obj = crud_profile.set_avatar(db, db_obj=profile_obj, avatar_url=public_url)
    return _with_qr_payload(profile_obj)


@router.get("/slug/{slug}", response_model=PublicProfileRead)
def get_public_profile(slug: str, db: Session = Depends(get_db)) -> PublicProfileRead:
    """
    Public endpoint (no auth) - resolves a scanned QR / shared link into
    a viewable card. Used for the "preview before saving" screen.
    """
    profile_obj = crud_profile.get_by_slug(db, slug=slug)
    if not profile_obj or not profile_obj.is_public:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    return profile_obj
