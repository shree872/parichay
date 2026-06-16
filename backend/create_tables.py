from database.connection import engine
from database.base import Base

import db_models.contact_db

Base.metadata.create_all(bind=engine)

print("Tables Created Successfully")