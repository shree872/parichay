import secrets

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileUpdate


class CRUDProfile(CRUDBase[Profile, ProfileCreate, ProfileUpdate]):
    def get_by_user_id(self, db: Session, *, user_id: int) -> Profile | None:
        stmt = select(Profile).where(Profile.user_id == user_id)
        return db.scalars(stmt).first()

    def get_by_slug(self, db: Session, *, slug: str) -> Profile | None:
        stmt = select(Profile).where(Profile.slug == slug)
        return db.scalars(stmt).first()

    def _generate_unique_slug(self, db: Session, *, display_name: str) -> str:
        base = slugify(display_name)[:40] or "card"
        for _ in range(10):
            candidate = f"{base}-{secrets.token_hex(3)}"
            if not self.get_by_slug(db, slug=candidate):
                return candidate
        # Extremely unlikely fallback
        return f"{base}-{secrets.token_hex(6)}"

    def create_for_user(self, db: Session, *, user_id: int, obj_in: ProfileCreate) -> Profile:
        slug = self._generate_unique_slug(db, display_name=obj_in.display_name)
        db_obj = Profile(
            user_id=user_id,
            slug=slug,
            display_name=obj_in.display_name,
            title=obj_in.title,
            company=obj_in.company,
            bio=obj_in.bio,
            phone=obj_in.phone,
            public_email=obj_in.public_email,
            website=obj_in.website,
            address=obj_in.address,
            social_links=obj_in.social_links.model_dump(),
            theme=obj_in.theme,
            is_public=obj_in.is_public,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Profile, obj_in: ProfileUpdate) -> Profile:
        data = obj_in.model_dump(exclude_unset=True)
        if "social_links" in data and data["social_links"] is not None:
            data["social_links"] = data["social_links"]
        for field, value in data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def set_avatar(self, db: Session, *, db_obj: Profile, avatar_url: str) -> Profile:
        db_obj.avatar_url = avatar_url
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


profile = CRUDProfile(Profile)
