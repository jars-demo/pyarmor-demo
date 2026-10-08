# Protect your own project

> ⏱ 10 minutes · The workshop's workflow, applied to a project you already have.

> [!IMPORTANT]
> Only for code **you own or have the rights to**. PyArmor's terms do not allow obfuscating other
> people's scripts, and the free trial is not for commercial products that earn real money. Read the
> [license terms](https://pyarmor.readthedocs.io/en/latest/licenses.html) first.

Commands below use `mypkg/` (your package) and `main.py` (its entry script). Rename to match yours.

## 1. Build where you run

Build with the **same Python minor version, OS and CPU architecture** you deploy to. A build made on
Python 3.12 does not load on 3.11 ([chapter 06](06-runtime.md)). Inside Docker, use the same base
image for building and running.

```bash
python --version
pip install pyarmor==9.2.7
```

## 2. Obfuscate

```bash
pyarmor gen -O dist app.py                    # one script
pyarmor gen -O dist -r main.py mypkg          # entry script + package, recursive
pyarmor gen -O dist -r --exclude "mypkg/tests" main.py mypkg   # leave a folder out
```

> **Expected:** `INFO     obfuscate scripts OK`, and `dist/` with your protected files plus
> `pyarmor_runtime_000000/`.

> [!CAUTION]
> PyArmor 9.2.7 exits with status 0 even on `ERROR out of license` (a module too big for the trial).
> Check the log, not the exit code. [`scripts/obfuscate.py`](../scripts/obfuscate.py) does this; copy
> it and change `PACKAGE`.

## 3. Copy what PyArmor does not

Only `.py` files are written to `dist/`. Data files (JSON, templates, static files) are not copied,
and the app fails without them:

```text
FileNotFoundError: [Errno 2] No such file or directory: '.../dist/mypkg/config.json'
```

```bash
cp mypkg/config.json dist/mypkg/
cp -r mypkg/templates dist/mypkg/
```

## 4. Check it

```bash
cd dist
python main.py
```

Then run your test suite against `dist/` instead of the source. [`tests/conftest.py`](../tests/conftest.py)
shows a small switch for that, and [`scripts/verify.py`](../scripts/verify.py) checks that every
module is obfuscated and no names leak.

## 5. Ship

Ship `dist/` (protected code + runtime) and your pinned dependencies, never the source. For a
container, copy the two-stage pattern in [`app/backend/Dockerfile`](../app/backend/Dockerfile).

| If you use | Note |
|---|---|
| uvicorn / gunicorn `"mypkg.main:app"` | Works when `dist/` is the working directory or on `PYTHONPATH` |
| PyInstaller | Use `pyarmor gen --pack onedir`; import your app directly in the entry script ([chapter 08](08-packaging.md)) |
| Django / Flask | Copy templates, static files and migrations data as in step 3 |

## Before production

- No secrets in code, protected or not ([chapter 11](11-security-reality.md)).
- Obfuscation raises the effort to read your code. It does not protect the machine it runs on.
- Pin PyArmor, register a license for commercial use, and keep the build in CI ([chapter 12](12-best-practices.md)).
