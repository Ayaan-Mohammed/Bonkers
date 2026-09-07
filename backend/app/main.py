from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import settings
from .routers import intelligence, parcels

app = FastAPI(title="Parcel Intelligence API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parcels.router)
app.include_router(intelligence.router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
