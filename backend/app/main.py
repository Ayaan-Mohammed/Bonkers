from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
)

# CORS middleware for Frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1 import auth, parcels, audit, consents, alerts, grievances, developer

# Mount API v1 Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(parcels.router, prefix=settings.API_V1_PREFIX)
app.include_router(audit.router, prefix=settings.API_V1_PREFIX)
app.include_router(consents.router, prefix=settings.API_V1_PREFIX)
app.include_router(alerts.router, prefix=settings.API_V1_PREFIX)
app.include_router(grievances.router, prefix=settings.API_V1_PREFIX)
app.include_router(developer.router, prefix=settings.API_V1_PREFIX)



@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Basic health-check endpoint for load balancers and container probes."""
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


@app.get("/", tags=["root"])
def root() -> dict[str, str]:
    """Root info endpoint directing to API documentation."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": f"{settings.API_V1_PREFIX}/docs",
        "health": "/health",
    }
