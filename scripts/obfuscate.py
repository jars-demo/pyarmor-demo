"""Obfuscate the `app` package with PyArmor into build/protected/.

    python scripts/obfuscate.py                      # → build/protected/
    python scripts/obfuscate.py -O build/expired -- -e 2020-01-01

It runs one command, and prints it so you can see there is no magic:

    pyarmor gen -O build/protected -r app

Anything after `--` is passed to `pyarmor gen` unchanged.

Why a script and not just the command? PyArmor exits with status 0 even when it refuses to
obfuscate (for example "ERROR out of license" when a module is too big for the trial). This script
reads PyArmor's log and fails loudly, so a broken build never looks like a good one. Run
scripts/verify.py afterwards to check the output.

Standard library only. Runs on Windows, macOS and Linux.
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = "app"


def find_pyarmor() -> list[str]:
    """Prefer the pyarmor next to this interpreter (the venv), then any on PATH."""
    scripts_dir = Path(sys.executable).parent
    for name in ("pyarmor", "pyarmor.exe"):
        candidate = scripts_dir / name
        if candidate.exists():
            return [str(candidate)]
    found = shutil.which("pyarmor")
    if found:
        return [found]
    sys.exit("pyarmor not found. Install it first: uv sync  (or: pip install pyarmor==9.2.7)")


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument("-O", "--output", default="build/protected", help="output folder")
    parser.add_argument("extra", nargs="*", help="extra `pyarmor gen` options, after --")
    args = parser.parse_args()

    output = (ROOT / args.output).resolve()
    if ROOT not in output.parents:
        sys.exit(f"Refusing to write outside the repository: {output}")
    if output.exists():
        shutil.rmtree(output)  # stale files from an older build would hide a failed one

    pyarmor = find_pyarmor()
    command = [*pyarmor, "gen", "-O", args.output, "-r", *args.extra, PACKAGE]
    print("$ " + " ".join(["pyarmor", *command[len(pyarmor) :]]), flush=True)

    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    log = result.stdout + result.stderr
    print(log.rstrip())

    errors = [line for line in log.splitlines() if "ERROR" in line]
    if result.returncode != 0 or errors or "obfuscate scripts OK" not in log:
        print("\nObfuscation FAILED.", file=sys.stderr)
        if any("out of license" in line for line in errors):
            print(
                "A module is too big for the PyArmor trial. Split it into smaller modules, "
                "or use a licensed PyArmor. See workshop/05-obfuscation.md.",
                file=sys.stderr,
            )
        return 1

    print(f"\nProtected build written to {output.relative_to(ROOT)}")
    print("Next: python scripts/verify.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
