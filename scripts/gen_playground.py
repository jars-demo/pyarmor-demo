"""Generate the website Playground's data: real PyArmor output for each example.

    uv run python scripts/gen_playground.py

For every file in examples/playground/ (plus the app's real scoring module) this script:
  1. obfuscates it with `pyarmor gen` into a temporary folder;
  2. runs one expression against the original and the protected module, to prove both agree;
  3. writes original source, protected output and both results to
     app/frontend/src/data/playground.json.

The JSON is committed on purpose: the website is static and never runs PyArmor or any Python.
The protected payload is shortened for display (the real size is recorded). Regenerate it after
changing an example or upgrading PyArmor. Standard library only, plus PyArmor.
"""

import json
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "app" / "frontend" / "src" / "data" / "playground.json"
SHOW_BYTES = 900  # characters of the encrypted payload shown on the page

EXAMPLES = [
    {
        "id": "simple-function",
        "title": "Simple Function",
        "file": "examples/playground/simple_function.py",
        "check": "apply_discount(100, 3)",
    },
    {
        "id": "business-logic",
        "title": "Business Logic",
        "file": "examples/playground/business_logic.py",
        "check": "quote(12.5, 600, priority=True)",
    },
    {
        "id": "class",
        "title": "Class",
        "file": "examples/playground/class_example.py",
        "check": "ChurnPredictor.strict().risk(logins_last_30d=2, open_tickets=3)",
    },
    {
        "id": "fastapi-endpoint",
        "title": "FastAPI Endpoint",
        "file": "examples/playground/fastapi_endpoint.py",
        "check": "score_order(Order(amount=7200, country='xx'))",
    },
    {
        "id": "utility-module",
        "title": "Utility Module",
        "file": "examples/playground/utility_module.py",
        "check": "slugify('Protect Python, Honestly!')",
    },
    {
        "id": "secret-analytics",
        "title": "Secret Analytics: scoring.py",
        "file": "app/backend/business_logic/scoring.py",
        "check": "calculate_business_score(0.8125, 0.9027, 23.26)",
    },
]


def pyarmor() -> str:
    for name in ("pyarmor", "pyarmor.exe"):
        candidate = Path(sys.executable).parent / name
        if candidate.exists():
            return str(candidate)
    sys.exit("pyarmor not found next to this Python. Run: uv run python scripts/gen_playground.py")


def evaluate(folder: Path, module: str, expression: str) -> str:
    code = f"from {module} import *; print(repr({expression}))"
    result = subprocess.run(
        [sys.executable, "-c", code], cwd=folder, capture_output=True, text=True, check=False
    )
    if result.returncode != 0:
        sys.exit(f"{module}: {expression} failed in {folder}:\n{result.stderr}")
    return result.stdout.strip()


def shorten(protected: str) -> str:
    """Keep the header and the start of the payload; the payload is one very long line."""
    lines = protected.splitlines()
    return "\n".join(
        line if len(line) <= SHOW_BYTES else line[:SHOW_BYTES] + "  …(shortened)…" for line in lines
    )


def main() -> int:
    version = subprocess.run([pyarmor(), "--version"], capture_output=True, text=True)
    pyarmor_version = version.stdout.splitlines()[0].strip()
    examples = []
    with tempfile.TemporaryDirectory() as tmp:
        for example in EXAMPLES:
            source = ROOT / example["file"]
            module = source.stem
            out = Path(tmp) / example["id"]
            log = subprocess.run(
                [pyarmor(), "gen", "-O", str(out), str(source)], capture_output=True, text=True
            )
            if "obfuscate scripts OK" not in log.stdout + log.stderr:
                sys.exit(f"PyArmor failed on {source}:\n{log.stdout}{log.stderr}")

            protected = (out / source.name).read_text(encoding="utf-8")
            original_result = evaluate(source.parent, module, example["check"])
            protected_result = evaluate(out, module, example["check"])
            if original_result != protected_result:
                sys.exit(f"{module}: original {original_result} != protected {protected_result}")

            examples.append(
                {
                    "id": example["id"],
                    "title": example["title"],
                    "file": example["file"],
                    "original": source.read_text(encoding="utf-8").replace("\r\n", "\n"),
                    "protected": shorten(protected),
                    "protected_bytes": len(protected.encode()),
                    "check": example["check"],
                    "result": protected_result,
                }
            )
            print(f"✓ {example['file']}: {example['check']} = {protected_result} (both builds)")

    data = {
        "generated": date.today().isoformat(),
        "pyarmor": pyarmor_version,
        "python": sys.version.split()[0],
        "examples": examples,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
