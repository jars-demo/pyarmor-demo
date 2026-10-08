"""Show what a running process still reveals about a protected module.

    python scripts/runtime_view.py                        # the original source
    python scripts/runtime_view.py --dir build/protected  # the protected build

Obfuscation protects the files on disk. But to run, the code must be loaded into a Python
process, and once it is, Python's normal introspection works on it. This script imports the
scoring module and prints what anyone who can run Python code in the same environment can see,
using only public, documented features (vars, inspect.signature, __doc__).

It does not decompile or deobfuscate anything. The point is the lesson from the Security
Reality chapter: if someone controls the machine where your code runs, obfuscation is not the
security boundary. Keep secrets out of code, and protect the environment.
"""

import argparse
import inspect
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument("--dir", help="folder that contains a protected app/ (default: the source)")
    parser.add_argument("--module", default="app.business_logic.scoring")
    args = parser.parse_args()

    sys.path.insert(0, str((ROOT / args.dir).resolve() if args.dir else ROOT))
    module = __import__(args.module, fromlist=["_"])
    protected = "__pyarmor__" in vars(module)

    print(f"Module : {args.module}")
    print(f"File   : {Path(module.__file__).relative_to(ROOT)}")
    print(f"Build  : {'protected (PyArmor)' if protected else 'original source'}\n")

    functions = [v for v in vars(module).values() if inspect.isfunction(v)]
    print("Can Python show a function's source code?")
    try:
        lines = inspect.getsource(functions[-1]).splitlines()
        print(f"  yes: inspect.getsource({functions[-1].__name__}) returns it:")
        print("\n".join(f"    {line}" for line in lines[:4]) + "\n    ...\n")
    except (OSError, TypeError, IndexError):
        print("  no: inspect.getsource() fails, the file on disk holds obfuscated bytes\n")

    print("Visible at runtime anyway:")
    for name, value in vars(module).items():
        if name.startswith("__"):
            continue
        if inspect.isfunction(value):
            doc = (value.__doc__ or "").strip().splitlines()
            print(f"  function {name}{inspect.signature(value)}")
            if doc:
                print(f"           doc: {doc[0]}")
        elif isinstance(value, (int, float, str, dict, tuple, list)):
            print(f"  constant {name} = {value!r}")
    print(
        "\nNames, signatures, docstrings and every constant are still readable from inside the "
        "process.\nObfuscation raises the effort to read the logic; it does not hide data the "
        "program uses."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
