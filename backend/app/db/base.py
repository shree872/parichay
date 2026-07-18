from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


# Import all models here so that Base.metadata is aware of every table
# before create_all() (or Alembic's autogenerate) runs. This is the single
# source of truth for "what tables exist" in the app.
from app.models.user import User          # noqa: E402,F401
from app.models.profile import Profile    # noqa: E402,F401
from app.models.connection import Connection  # noqa: E402,F401
