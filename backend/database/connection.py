from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:shree123@localhost:5432/parichay"

engine = create_engine(DATABASE_URL)

print("Database Connected Successfully")