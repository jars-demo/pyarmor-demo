# 06 · Runtime

> ⏱ 15 minutes · You will break the protected app on purpose, three different ways, and learn what
> each failure means. Then you will add an expiry date to a build.

## Why protected code needs a runtime

A protected module contains no Python logic, only an encrypted payload and one call:

```python
from pyarmor_runtime_000000 import __pyarmor__

__pyarmor__(__name__, __file__, b"PY000000...")
```

`pyarmor_runtime_000000` is the **runtime package**: a tiny `__init__.py` plus a compiled extension
(`pyarmor_runtime.so` on Linux and macOS, `.pyd` on Windows). When a protected module is imported,
the runtime decrypts its payload and turns it into code objects. Each function is obfuscated
separately too: by default ("wrap mode"), a function is restored when it is entered and obfuscated
again when it returns.

```text
import app.main
   └─ app/backend/main.py (protected) ─ from pyarmor_runtime_000000 import __pyarmor__
                                   └─ pyarmor_runtime.so  ← decrypts, restores, runs
```

Three things follow from this design:

1. **No runtime, no app.** Every protected module imports it first.
2. **The runtime is a compiled binary**, built for one platform and one Python version.
3. **The runtime enforces the build's restrictions**, such as an expiry date or a device binding.

## Failure 1: the runtime is missing

Move the runtime out of the way:

```bash
mv build/protected/pyarmor_runtime_000000 build/runtime-backup
cd build/protected
uv run python -m app
```

> **What it does:** hides the runtime package, then tries to start the protected API.
> **Why:** this is the most common deployment mistake: copying the protected `app/` folder and
> forgetting the runtime next to it.
> **Expected:** the app stops at the very first protected file:
>
> ```text
>   File ".../build/protected/app/__init__.py", line 2, in <module>
>     from pyarmor_runtime_000000 import __pyarmor__
> ModuleNotFoundError: No module named 'pyarmor_runtime_000000'
> ```

Put it back and confirm the app starts again:

```bash
cd ../..
mv build/runtime-backup build/protected/pyarmor_runtime_000000
uv run python scripts/verify.py
```

> **Expected:** the three ✓ lines from chapter 05.

> [!TIP]
> If the runtime should travel **inside** your package (for example, to ship `app/` as one
> folder), add `-i`: `pyarmor gen -O build/inside -r -i --exclude app/frontend app`. The runtime then lives at
> `build/inside/app/pyarmor_runtime_000000/`. We verified this works with this app; the default
> layout is used in the rest of the workshop.

## Failure 2: the wrong Python version

The runtime is compiled against one CPython minor version. This repository builds with 3.12. On
another version, the runtime cannot load:

| Where | Error, seen when a 3.12 build runs on Python 3.11 |
|---|---|
| Linux (`python:3.11-slim`) | `ImportError: .../pyarmor_runtime.so: undefined symbol: _PyThreadState_GetCurrent` |
| Windows | `ImportError: DLL load failed while importing pyarmor_runtime: The specified module could not be found.` |

If you have another Python installed, you can see it yourself (here with the Windows `py`
launcher):

```bash
cd build/protected
py -3.11 -c "import app.backend.business_logic.scoring"
cd ../..
```

> **What it does:** imports a protected module with Python 3.11.
> **Why:** builds are not portable across Python versions or platforms. Build on the same OS,
> CPU architecture and Python version you deploy to. That is why the Dockerfile in chapter 09
> builds inside the **same** `python:3.12-slim` image it runs on.
> **Expected:** the `ImportError` from the table above.

PyArmor can also build for other platforms with `--platform` (for example, `linux.x86_64`).
That needs extra runtime downloads and is not covered here; building inside Docker is simpler.

## Failure 3: an expired build

`-e` sets an expiry date for a build, either as a date (`2027-12-31`) or a number of days from
now (`30`). Build one that has already expired:

```bash
uv run python scripts/obfuscate.py -O build/expired -- -e 2020-01-01
cd build/expired
uv run python -m app
cd ../..
```

> **What it does:** builds a protected copy that expired on 1 January 2020 (`--` passes `-e` on to
> `pyarmor gen`), then tries to start it.
> **Why:** expiry is useful for trials, evaluation copies and time-limited demos.
> **Expected:** the build succeeds, but starting it fails:
>
> ```text
> RuntimeError: this license key is expired (1:11086)
> ```

A build with `-e 30` starts normally and refuses to run 30 days later.

> [!NOTE]
> Since PyArmor 8.5, expiry checks the **local clock** by default, which the person running the
> app controls. To check an internet time server instead: `pyarmor cfg nts=pool.ntp.org`. Even then,
> expiry is a licensing convenience, not a security boundary. Someone who controls the machine
> controls what it believes about time and network.

## Device binding

`-b` binds a build to a machine: a MAC address, an IPv4 address or a disk serial number. First,
read the values of the target machine:

```bash
uv run python -m pyarmor.cli.hdinfo
```

> **What it does:** prints this machine's identifiers as PyArmor sees them: machine ID, disk
> serial, MAC and IPv4 addresses.
> **Why:** you run this **on the target machine** and bind the build to what it prints.
> **Expected:** lines like `Default Harddisk Serial Number: '...'` and
> `Default Mac address: '...'`.

> [!CAUTION]
> These values identify a real machine. Do not paste them into issues, chats or commits.

What happens on any other machine:

```bash
uv run pyarmor gen -O build/bound -r --exclude app/frontend -b "00:11:22:33:44:55" app
cd build/bound
uv run python -m app
cd ../..
```

> **What it does:** binds a build to a made-up MAC address, then runs it here.
> **Expected:** `RuntimeError: this license key is not for this machine (1:10235)`

Device binding suits software installed on known hardware. It is a poor fit for containers and
autoscaled servers, where MAC and IP addresses change all the time.

Clean up:

```bash
rm -rf build/expired build/bound
```

Next: [07 · Original vs protected](07-compare.md)
