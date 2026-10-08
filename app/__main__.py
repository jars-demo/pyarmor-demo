"""`python -m app` starts the API with uvicorn, using the settings from the environment."""

import logging

import uvicorn

from app.core.config import load_settings


def main() -> None:
    settings = load_settings()
    logging.basicConfig(
        level=settings.log_level.upper(), format="%(levelname)s %(name)s %(message)s"
    )
    uvicorn.run(
        "app.main:app", host=settings.host, port=settings.port, log_level=settings.log_level
    )


if __name__ == "__main__":
    main()
