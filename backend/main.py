from fastapi import FastAPI
from routes.contacts import router as contacts_router
from routes.auth import router as auth_router
from routes.upload import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contacts_router)

app.include_router(upload_router)

@app.get("/")
def home():
    return {
        "message": "Parichay Backend Running"
    }
app.include_router(auth_router)