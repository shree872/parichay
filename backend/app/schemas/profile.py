from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

CardTheme = Literal["classic", "midnight", "sunrise", "forest", "graphite"]


class SocialLinks(BaseModel):
    linkedin: str | None = None
    twitter: str | None = None
    instagram: str | None = None
    facebook: str | None = None


class ProfileBase(BaseModel):
    display_name: str = Field(min_length=1, max_length=150)
    title: str | None = Field(default=None, max_length=150)
    company: str | None = Field(default=None, max_length=150)
    bio: str | None = Field(default=None, max_length=2000)
    phone: str | None = Field(default=None, max_length=32)
    public_email: str | None = Field(default=None, max_length=255)
    website: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=255)
    social_links: SocialLinks = Field(default_factory=SocialLinks)
    theme: CardTheme = "classic"
    is_public: bool = True


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=150)
    title: str | None = Field(default=None, max_length=150)
    company: str | None = Field(default=None, max_length=150)
    bio: str | None = Field(default=None, max_length=2000)
    phone: str | None = Field(default=None, max_length=32)
    public_email: str | None = Field(default=None, max_length=255)
    website: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=255)
    social_links: SocialLinks | None = None
    theme: CardTheme | None = None
    is_public: bool | None = None


class ProfileRead(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    slug: str
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime
    qr_payload: str | None = None  # populated by the endpoint, not stored on the model


class PublicProfileRead(BaseModel):
    """Trimmed view returned when someone views a card via its public slug."""

    model_config = ConfigDict(from_attributes=True)

    slug: str
    display_name: str
    title: str | None = None
    company: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    phone: str | None = None
    public_email: str | None = None
    website: str | None = None
    address: str | None = None
    social_links: SocialLinks
    theme: CardTheme
