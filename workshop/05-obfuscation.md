# 05 · Obfuscation

> ⏱ 15 minutes · You will protect one script, then the whole package, run the protected API, and
> verify it.

## Step 1: one script

Start small: protect a single module.

```bash
uv run pyarmor gen -O build/first app/backend/business_logic/transforms.py
```

> **What it does:** obfuscates `transforms.py` and writes the result to `build/first/`.
> **Why:** to see the smallest possible output before protecting a whole package.
> **Expected:** log lines ending in `INFO     obfuscate scripts OK`, and these files:
>
> ```text
> build/first/
> ├── transforms.py                     ← the protected module
> └── pyarmor_runtime_000000/           ← the runtime package
>     ├── __init__.py
>     └── pyarmor_runtime.so            (pyarmor_runtime.pyd on Windows)
> ```

Look inside the protected file:

```bash
head -c 300 build/first/transforms.py
```

> **What it does:** prints the first 300 bytes of the protected module.
> **Why:** to see what PyArmor actually wrote.
> **Expected:**
>
> ```text
> # Pyarmor 9.2.7 (trial), 000000, non-profits, 2026-10-08T14:33:22
> from pyarmor_runtime_000000 import __pyarmor__
> __pyarmor__(__name__, __file__, b'PY000000\x00\x03\x0c\x00\xcb\r\r\n\x80...
> ```

It is still a valid `.py` file, with three lines: a comment, an import of the runtime, and one call
that hands the runtime an encrypted blob. No function names, no constants, no logic.

And it still works:

```bash
cd build/first
uv run python -c "import transforms; print(transforms.value_index(75000))"
cd ../..
```

> **What it does:** imports the protected module and calls one of its functions.
> **Why:** to show the protected code runs like the original.
> **Expected:** `0.8125111168462118`, the same value the original returns.

## Step 2: the whole package

```bash
uv run pyarmor gen -O build/protected -r --exclude app/frontend app
```

> **What it does:** obfuscates every Python module in the `app` package. `-r` (recursive)
> includes sub-packages (`backend/`, `backend/api/`, `backend/core/`, ...). `-O` picks the output
> folder. `--exclude app/frontend` leaves out the website, which is not part of the API.
> **Why:** an application is a package, not a single script. Without `-r`, only the modules
> directly inside `app/` would be processed. Without the exclude, PyArmor would also pick up any
> `.py` files under `app/frontend/node_modules/` once the website's dependencies are installed.
> **Expected:** one `obfuscating file ...` line per module, then `obfuscate scripts OK`:
>
> ```text
> build/protected/
> ├── app/                            same structure as the source, every .py obfuscated
> │   ├── __init__.py  __main__.py
> │   └── backend/  main.py  api/  core/  services/  business_logic/
> └── pyarmor_runtime_000000/         one shared runtime, at the top level
> ```

> [!NOTE]
> The runtime sits **next to** the package, not inside it. Anything that runs the app must have
> `build/protected/` on its import path, so Python finds both `app` and `pyarmor_runtime_000000`.
> Chapter 06 covers the alternative (`-i`).

### Exclusions

`--exclude` leaves paths out. Try leaving out the API routes:

```bash
uv run pyarmor gen -O build/partial -r --exclude app/frontend --exclude app/backend/api app
```

> **What it does:** protects everything except the website and `app/backend/api/`.
> **Why:** you might leave out tests, data files, or a plugin interface others need to read.
> **Expected:** `build/partial/app/backend/` without an `api/` folder.

> [!WARNING]
> Excluded files are **not copied** to the output: they are simply missing. This build would fail
> to start, because `app/backend/main.py` imports `app.backend.api`. If you exclude code that still
> needs to ship, copy it into the output yourself.

## Step 3: use the script

Typing the command is the best way to learn it. For everyday use, the repository wraps it:

```bash
uv run python scripts/obfuscate.py
```

> **What it does:** deletes any old `build/protected/`, prints and runs
> `pyarmor gen -O build/protected -r --exclude app/frontend app`, and **fails if PyArmor logged
> an error**.
> **Why:** PyArmor 9.2.7 exits with status 0 even when it refuses to obfuscate (chapter 04). A
> wrapper that reads the log stops a broken build from looking like a good one.
> **Expected:** the PyArmor log, then `Protected build written to build/protected`.

## Step 4: run the protected API

```bash
cd build/protected
uv run python -m app
```

> **What it does:** starts the API from the protected build. uv still finds the project's
> environment (it looks in parent folders), and `python -m app` now imports the protected `app`
> because it is in the current folder.
> **Why:** this is the moment of truth: protected code, same app.
> **Expected:** `Uvicorn running on http://127.0.0.1:8300`.

In a second terminal, from the repository root:

```bash
uv run python scripts/smoke.py --expect-build protected
```

> **What it does:** the same HTTP check as in chapter 03, now also asserting the build is the
> protected one.
> **Expected:**
>
> ```text
> ✓ GET  /health        200 at http://localhost:8300
> ✓ GET  /api/info      build=protected runtime=pyarmor_runtime_000000
> ✓ POST /api/analyze   200 {'score': 78.33, 'risk_score': 23.26, 'classification': 'strategic'}
> ✓ POST /api/analyze   422 for invalid input
> ✓ GET  /api/report    200 analyses=1
> Smoke test passed
> ```

Stop the server (**Ctrl+C**) and go back to the repository root (`cd ../..`).

## Step 5: verify

```bash
uv run python scripts/verify.py --tests
```

> **What it does:** four static checks on `build/protected/`, then the full test suite against it:
>
> 1. every module in `app/` has a protected counterpart, and nothing extra;
> 2. every protected file has the PyArmor header and payload;
> 3. the runtime package is present, with its binary;
> 4. no function name, constant name or long string from the source appears as plain text.
>
> **Why:** "it ran once" is not verification. The same 36 tests that passed on the source must
> pass on the protected build.
> **Expected:**
>
> ```text
> Checked 16 protected modules and 1 runtime package(s).
>   ✓ every module is obfuscated and present
>   ✓ the PyArmor runtime is present
>   ✓ no function names, constant names or long strings found as plain text
>
> $ PYARMOR_DEMO_APP_DIR=build/protected pytest -q
> 38 passed in 0.12s
>   ✓ the protected build passes the same tests as the original
> ```

Clean up the practice builds:

```bash
rm -rf build/first build/partial
```

(PowerShell: `Remove-Item -Recurse -Force build/first, build/partial`)

Next: [06 · Runtime](06-runtime.md)
