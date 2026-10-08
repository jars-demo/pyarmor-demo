"""A utility module: helpers many parts of an app import."""

import hashlib
import re

_SLUG = re.compile(r"[^a-z0-9]+")


def slugify(text: str) -> str:
    """'Hello, World!' -> 'hello-world'"""
    return _SLUG.sub("-", text.lower()).strip("-")


def fingerprint(*parts: str) -> str:
    """A short, stable id for a combination of values."""
    digest = hashlib.sha256("|".join(parts).encode()).hexdigest()
    return digest[:12]


def chunk(items: list, size: int) -> list[list]:
    """Split a list into lists of at most `size` items."""
    return [items[i : i + size] for i in range(0, len(items), size)]
