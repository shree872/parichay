from fastapi import FastAPI
from routes.contacts import router as contacts_router

app = FastAPI()

app.include_router(contacts_router)

@app.get("/")
def home():
    return {
        "message": "Parichay Backend Running"
    }
