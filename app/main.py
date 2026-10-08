"""FastAPI app factory. Start here when reading the code."""

from fastapi import FastAPI

from app.api.routes import router
from app.core.config import APP_NAME, APP_VERSION, Settings, load_settings
from app.services.analytics import Report


def create_app(settings: Settings | None = None) -> FastAPI:
    app = FastAPI(
        title=APP_NAME,
        version=APP_VERSION,
        description="Demo API for the pyarmor-demo workshop. All logic and data are fictional.",
    )
    app.state.settings = settings or load_settings()
    app.state.report = Report()
    app.include_router(router)
    return app


app = create_app()
