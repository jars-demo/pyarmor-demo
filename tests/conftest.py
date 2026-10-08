"""Shared fixtures, and the switch that runs this same suite against the protected build.

By default the tests import `app` from the repository (the original source). Set
PYARMOR_DEMO_APP_DIR to a folder that contains a protected `app/` (e.g. build/protected) and the
tests import that one instead. Set PYARMOR_DEMO_EXPECT_BUILD to `original` or `protected` to also
assert which build was loaded, so a misconfigured run cannot pass silently.
"""

import os
import sys
from pathlib import Path

import pytest

APP_DIR = os.getenv("PYARMOR_DEMO_APP_DIR")
if APP_DIR:
    sys.path.insert(0, str(Path(APP_DIR).resolve()))

from fastapi.testclient import TestClient  # noqa: E402

from app.core.config import Settings  # noqa: E402
from app.main import create_app  # noqa: E402

EXPECT_BUILD = os.getenv("PYARMOR_DEMO_EXPECT_BUILD")


@pytest.fixture
def client() -> TestClient:
    settings = Settings(host="127.0.0.1", port=0, log_level="warning", environment="test")
    return TestClient(create_app(settings))


@pytest.fixture
def expected_build() -> str | None:
    return EXPECT_BUILD
