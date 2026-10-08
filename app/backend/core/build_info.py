"""Tell the original build from the protected one, so /api/info can report which is running.

PyArmor rewrites every module to start with `from pyarmor_runtime_xxxxxx import __pyarmor__`, so
a protected module has `__pyarmor__` in its globals and an original one does not.
"""

import sys


def is_protected() -> bool:
    return "__pyarmor__" in globals()


def runtime_package() -> str | None:
    """Name of the loaded PyArmor runtime package, if any."""
    for name in sys.modules:
        if name.startswith("pyarmor_runtime_") and "." not in name:
            return name
    return None


def build_flavour() -> str:
    return "protected" if is_protected() else "original"
