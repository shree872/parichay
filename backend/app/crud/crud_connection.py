from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.connection import Connection, ConnectionSource
from app.models.profile import Profile
from app.schemas.connection import ConnectionUpdate


class CRUDConnection(CRUDBase[Connection, dict, ConnectionUpdate]):
    def list_for_owner(
        self,
        db: Session,
        *,
        owner_id: int,
        search: str | None = None,
        tag: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Connection]:
        stmt = select(Connection).where(Connection.owner_id == owner_id)

        if search:
            pattern = f"%{search.lower()}%"
            stmt = stmt.where(
                or_(
                    Connection.full_name.ilike(pattern),
                    Connection.company.ilike(pattern),
                    Connection.title.ilike(pattern),
                )
            )
        if tag:
            stmt = stmt.where(Connection.tags.any(tag))

        stmt = stmt.order_by(Connection.created_at.desc()).offset(skip).limit(limit)
        return list(db.scalars(stmt).all())

    def create_manual(self, db: Session, *, owner_id: int, data: dict) -> Connection:
        return self.create(
            db, obj_in={**data, "owner_id": owner_id, "source": ConnectionSource.MANUAL}
        )

    def create_from_scan(self, db: Session, *, owner_id: int, data: dict) -> Connection:
        return self.create(
            db, obj_in={**data, "owner_id": owner_id, "source": ConnectionSource.SCAN}
        )

    def create_from_profile(
        self, db: Session, *, owner_id: int, source_profile: Profile, notes: str | None, tags: list[str]
    ) -> Connection:
        return self.create(
            db,
            obj_in={
                "owner_id": owner_id,
                "source": ConnectionSource.QR,
                "linked_profile_id": source_profile.id,
                "full_name": source_profile.display_name,
                "title": source_profile.title,
                "company": source_profile.company,
                "email": source_profile.public_email,
                "phone": source_profile.phone,
                "website": source_profile.website,
                "notes": notes,
                "tags": tags,
            },
        )


connection = CRUDConnection(Connection)
