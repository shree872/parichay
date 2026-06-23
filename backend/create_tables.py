from database.connection import engine
from database.base import Base
from db_models.user_db import UserDB
import db_models.contact_db

Base.metadata.create_all(bind=engine)

print("Tables Created Successfully")