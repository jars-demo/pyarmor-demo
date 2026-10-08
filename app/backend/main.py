"""FastAPI app factory. Start here when reading the code."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.backend.api.routes import router
from app.backend.core.config import APP_NAME, APP_VERSION, Settings, load_settings
from app.backend.services.analytics import Report


def create_app(settings: Settings | None = None) -> FastAPI:
    app = FastAPI(
        title=APP_NAME,
        version=APP_VERSION,
        description="Demo API for the pyarmor-demo workshop. All logic and data are fictional.",
    )
    app.state.settings = settings = settings or load_settings()
    app.state.report = Report()
    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(settings.cors_origins),
            allow_methods=["GET", "POST"],
            allow_headers=["Content-Type"],
        )
    app.include_router(router)
    return app


app = create_app()
