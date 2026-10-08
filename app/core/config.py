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


def load_settings() -> Settings:
    return Settings(
        host=os.getenv("PYARMOR_DEMO_HOST", "127.0.0.1"),
        port=int(os.getenv("PYARMOR_DEMO_PORT", "8300")),
        log_level=os.getenv("PYARMOR_DEMO_LOG_LEVEL", "info").lower(),
        environment=os.getenv("PYARMOR_DEMO_ENV", "development"),
    )
