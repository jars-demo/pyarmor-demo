"""Check a protected build: is it really obfuscated, complete, and does it behave the same?

    python scripts/verify.py                 # static checks on build/protected
    python scripts/verify.py --tests         # ...then run the full test suite against it
    python scripts/verify.py --dir build/x   # check another build

Static checks:
  1. Every Python module in app/ has a protected counterpart, and nothing extra was added.
  2. Every protected module starts with PyArmor's header and calls __pyarmor__.
  3. The PyArmor runtime package (pyarmor_runtime_*) is present, with its binary extension.
  4. Names from the original source (functions, constants, strings) cannot be found as plain
     text in the protected files.

With --tests, the same pytest suite that tests the original source runs against the protected
build. Identical results are the proof that obfuscation did not change behaviour.

The protected build only runs on the Python version and platform that built it, so run this with
the same interpreter you used for obfuscate.py. Standard library only.
"""

import argparse
import ast
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "app"
FRONTEND = SOURCE / "frontend"  # the website: not Python, never obfuscated
MIN_STRING = 8  # shorter strings ("score", "watch") also appear in unrelated binary noise
PAYLOAD_START = b"__pyarmor__(__name__, __file__,"


def source_identifiers(path: Path) -> set[str]:
    """Function, class and module-level names, plus longer string constants, from one file."""
    tree = ast.parse(path.read_text(encoding="utf-8"))
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            if not node.name.startswith("__"):
                names.add(node.name)
        elif (
            isinstance(node, ast.Constant)
            and isinstance(node.value, str)
            and len(node.value) >= MIN_STRING
            and node.value.isprintable()
        ):
            names.add(node.value)
    for node in tree.body:
        if isinstance(node, ast.Assign):
            names.update(t.id for t in node.targets if isinstance(t, ast.Name))
    return names


def check(build: Path) -> list[str]:
    problems: list[str] = []
    protected_pkg = build / "app"
    if not protected_pkg.is_dir():
        return [f"{protected_pkg.relative_to(ROOT)} not found. Run scripts/obfuscate.py first."]

    sources = {p.relative_to(SOURCE) for p in SOURCE.rglob("*.py") if FRONTEND not in p.parents}
    protected = {p.relative_to(protected_pkg) for p in protected_pkg.rglob("*.py")}
    for missing in sorted(sources - protected):
        problems.append(f"missing from build: app/{missing.as_posix()}")
    for extra in sorted(protected - sources):
        problems.append(f"unexpected file in build: app/{extra.as_posix()}")

    runtimes = sorted(build.glob("pyarmor_runtime_*"))
    if len(runtimes) != 1:
        problems.append(
            f"expected one pyarmor_runtime_* package in {build.name}/, found {len(runtimes)}"
        )
    else:
        runtime = runtimes[0]
        binaries = [*runtime.glob("pyarmor_runtime*.so"), *runtime.glob("pyarmor_runtime*.pyd")]
        if not (runtime / "__init__.py").exists() or not binaries:
            problems.append(f"{runtime.name}/ is incomplete: needs __init__.py and the extension")

    leaks: dict[str, list[str]] = {}
    for rel in sorted(sources & protected):
        data = (protected_pkg / rel).read_bytes()
        text = data.decode("utf-8", errors="replace")
        if not text.startswith("# Pyarmor") or PAYLOAD_START not in data:
            problems.append(f"app/{rel.as_posix()} is not obfuscated (no PyArmor header)")
            continue
        # Search only the payload: the header itself names __pyarmor__ and the runtime package.
        payload = data[data.find(PAYLOAD_START) + len(PAYLOAD_START) :]
        found = [name for name in source_identifiers(SOURCE / rel) if name.encode() in payload]
        if found:
            leaks[f"app/{rel.as_posix()}"] = sorted(found)
    for file, names in leaks.items():
        problems.append(f"{file} still contains readable source text: {', '.join(names)}")

    print(f"Checked {len(protected)} protected modules and {len(runtimes)} runtime package(s).")
    return problems


def run_tests(build: Path) -> int:
    env = {
        **os.environ,
        "PYARMOR_DEMO_APP_DIR": str(build),
        "PYARMOR_DEMO_EXPECT_BUILD": "protected",
    }
    command = [sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider"]
    print("\n$ PYARMOR_DEMO_APP_DIR=" + str(build.relative_to(ROOT)) + " pytest -q", flush=True)
    return subprocess.run(command, cwd=ROOT, env=env).returncode


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument("--dir", default="build/protected", help="protected build folder")
    parser.add_argument("--tests", action="store_true", help="also run the test suite against it")
    args = parser.parse_args()

    build = (ROOT / args.dir).resolve()
    problems = check(build)
    if problems:
        print("\nVerification FAILED:")
        for problem in problems:
            print(f"  ✗ {problem}")
        return 1
    print("  ✓ every module is obfuscated and present")
    print("  ✓ the PyArmor runtime is present")
    print("  ✓ no function names, constant names or long strings found as plain text")

    if args.tests:
        if run_tests(build) != 0:
            print("\nThe protected build does NOT behave like the original.")
            return 1
        print("  ✓ the protected build passes the same tests as the original")
    return 0


if __name__ == "__main__":
    sys.exit(main())
