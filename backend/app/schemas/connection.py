from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.connection import ConnectionSource


class ConnectionBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    title: str | None = Field(default=None, max_length=150)
    company: str | None = Field(default=None, max_length=150)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    website: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=4000)
    tags: list[str] = Field(default_factory=list)


class ConnectionCreateManual(ConnectionBase):
    """User types in a contact by hand."""
    pass


class ConnectionCreateFromProfile(BaseModel):
    """Saved after scanning another Parichay user's QR code."""
    slug: str
    notes: str | None = Field(default=None, max_length=4000)
    tags: list[str] = Field(default_factory=list)


class ConnectionCreateFromScan(ConnectionBase):
    """
    Confirmed/edited by the user after reviewing the AI OCR extraction
    returned by POST /connections/scan. raw_image_url comes from the
    upload step, not from client input directly.
    """
    raw_image_url: str | None = None


class ConnectionUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    title: str | None = Field(default=None, max_length=150)
    company: str | None = Field(default=None, max_length=150)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    website: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=4000)
    tags: list[str] | None = None


class ConnectionRead(ConnectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    linked_profile_id: int | None = None
    source: ConnectionSource
    raw_image_url: str | None = None
    created_at: datetime
    updated_at: datetime


class ScanExtractResult(BaseModel):
    """What the OCR endpoint returns for client-side review before saving."""

    raw_image_url: str
    full_name: str | None = None
    title: str | None = None
    company: str | None = None
    email: str | None = None
    phone: str | None = None
    website: str | None = None
    raw_text: str  # full OCR text dump, shown as a fallback in the UI
