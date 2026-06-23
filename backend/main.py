from fastapi import FastAPI
from routes.contacts import router as contacts_router
from routes.auth import router as auth_router

app = FastAPI()

app.include_router(contacts_router)

@app.get("/")
def home():
    return {
        "message": "Parichay Backend Running"
    }
app.include_router(auth_router)