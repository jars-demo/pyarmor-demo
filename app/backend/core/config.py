"""Settings, read from environment variables. Nothing here is secret; see .env.example."""

import os
from dataclasses import dataclass

APP_NAME = "Secret Analytics API"
APP_VERSION = "0.1.0"


@dataclass(frozen=True)
class Settings:
    host: str
    port: int
    log_level: str
    environment: str
    # Browser origins allowed to call the API: the frontend's dev server. In Docker the frontend
    # proxies /api on its own origin, so CORS is not needed there.
    cors_origins: tuple[str, ...] = ()


def load_settings() -> Settings:
    return Settings(
        host=os.getenv("PYARMOR_DEMO_HOST", "127.0.0.1"),
        port=int(os.getenv("PYARMOR_DEMO_PORT", "8300")),
        log_level=os.getenv("PYARMOR_DEMO_LOG_LEVEL", "info").lower(),
        environment=os.getenv("PYARMOR_DEMO_ENV", "development"),
        cors_origins=tuple(
            origin.strip()
            for origin in os.getenv(
                "PYARMOR_DEMO_CORS_ORIGINS", "http://localhost:3300,http://127.0.0.1:3300"
            ).split(",")
            if origin.strip()
        ),
    )
