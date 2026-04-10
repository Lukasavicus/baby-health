"""FastAPI main application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from config import settings, use_ui_seed
from routers import auth, babies, baby_ui_state, caregivers, events, dashboard, media, setup, ui_data

# Application lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print(f"Starting {settings.app_name} v{settings.app_version}")
    print(f"Storage type: {settings.storage_type}")
    print(f"Data directory: {settings.data_dir}")
    print(
        "UI bootstrap: "
        + (
            "seed JSON (BABYHEALTH_USE_UI_SEED=1)"
            if use_ui_seed()
            else "empty payload (set BABYHEALTH_USE_UI_SEED=1 for demo catalogs)"
        )
    )

    yield

    # Shutdown
    print(f"Shutting down {settings.app_name}")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API backend for BabyHealth - Samsung Health-inspired baby tracking app",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (API routes take priority; auth first — public)
app.include_router(auth.router)
app.include_router(babies.router)
app.include_router(caregivers.router)
app.include_router(events.router)
app.include_router(dashboard.router)
app.include_router(setup.router)
app.include_router(ui_data.router)
app.include_router(baby_ui_state.router)
app.include_router(media.router)


@app.get("/api")
async def api_root():
    """API info endpoint"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "message": "Welcome to BabyHealth API!",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.app_name,
    }


# Mount static files for SPA (see FRONTEND_DIST_DIR in config)
static_dir = settings.frontend_dist_dir
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.debug,
    )
