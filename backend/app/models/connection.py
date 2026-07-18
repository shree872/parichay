import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ConnectionSource(str, enum.Enum):
    QR = "qr"          # scanned another Parichay user's QR / card link
    SCAN = "scan"       # AI-scanned a physical paper business card
    MANUAL = "manual"   # typed in by hand


class Connection(Base):
    """
    A contact saved by a user. Snapshotted (full_name/title/company/...)
    so the contact list still reads correctly even if the source profile
    later changes or the contact isn't a Parichay user at all (scanned
    paper card). When `linked_profile_id` is set, the frontend can offer
    a "view live card" action that always reflects the latest data.
    """

    __tablename__ = "connections"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    linked_profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True
    )

    source: Mapped[ConnectionSource] = mapped_column(
        Enum(ConnectionSource, name="connection_source"), nullable=False
    )

    # Snapshot fields (always populated, regardless of source)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    title: Mapped[str | None] = mapped_column(String(150), nullable=True)
    company: Mapped[str | None] = mapped_column(String(150), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    raw_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User"] = relationship(back_populates="connections")
    linked_profile: Mapped["Profile | None"] = relationship()

    def __repr__(self) -> str:
        return f"<Connection id={self.id} full_name={self.full_name!r} source={self.source}>"
