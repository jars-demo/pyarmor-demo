# 08 · Packaging

> ⏱ 15 minutes · You will learn what a protected application consists of, and ship it two ways:
> as an archive, and as a single-folder executable built with PyInstaller. (The third way, a
> Docker image, is the next chapter.)

## What you are shipping

A protected Python application is always these four parts:

| Part | Where it comes from | Protected? |
|---|---|---|
| Your protected code | `build/protected/app/` | ✓ obfuscated by PyArmor |
| The PyArmor runtime | `build/protected/pyarmor_runtime_000000/` | a compiled binary |
| Third-party dependencies | `requirements.txt` (FastAPI, uvicorn, pydantic, ...) | ✗ plain, as published on PyPI |
| A Python interpreter | the target machine, a bundle, or a container image | n/a |

The interpreter has to be **the same Python minor version** that built the code (chapter 06).
Every packaging method below is a different way to deliver those four parts together.

## Option 1: an archive

The simplest delivery: the protected folder, plus a pinned dependency list.

```bash
mkdir -p dist
tar -czf dist/pyarmor-demo-protected.tar.gz -C build/protected .
```

> **What it does:** packs `app/` and `pyarmor_runtime_000000/` into one compressed archive (`tar`
> is built into macOS, Linux and Windows 10 and later).
> **Why:** this is what you hand to a customer, or copy to a server you manage.
> **Expected:** `dist/pyarmor-demo-protected.tar.gz`, a few hundred KB.

On the target, the recipient unpacks it, installs dependencies with
`pip install --require-hashes -r requirements.txt` into a Python 3.12 environment on the
**same OS and CPU architecture**, and runs `python -m app`.

> [!NOTE]
> **What about wheels?** You can put protected code into a wheel, but the wheel then contains a
> compiled runtime, so it must be tagged for one platform and one Python version (not
> `py3-none-any`). The packing section of PyArmor's [getting started guide](https://pyarmor.readthedocs.io/en/latest/tutorial/getting-started.html) shows the steps. For a
> service like this one, a container image (chapter 09) is the more common choice.

## Option 2: a single-folder executable with PyInstaller

[PyInstaller](https://pyinstaller.org/) is a separate tool. It bundles a Python interpreter, your
code and every dependency into one folder (or one file) with an executable. The person running it
does not need Python installed.

The two tools have different jobs:

| Tool | Job |
|---|---|
| **PyArmor** | makes your code hard to read |
| **PyInstaller** | puts code, interpreter and dependencies into one deliverable |

PyInstaller alone does **not** protect code: it stores ordinary Python bytecode, which can be
extracted and decompiled. And PyInstaller cannot see the imports inside obfuscated code, so it
would leave modules out. `pyarmor gen --pack` solves this: it lets PyInstaller analyse the original
scripts, then swaps in the obfuscated versions.

PyInstaller needs a script to start from, and `python -m app` is not a script. The repository
includes `run_api.py`, which just calls the same `main()`.

```bash
uv run --with pyinstaller==6.22.3 pyarmor gen --pack onedir --exclude ".venv" --exclude ".venv/*" --exclude app/frontend -r run_api.py app
```

> **What it does:** `uv run --with` adds PyInstaller 6.22.3 for this one command, without adding it
> to the project. PyArmor obfuscates `run_api.py` and the `app` package, then runs PyInstaller in
> `onedir` mode with the obfuscated code and the runtime.
> **Why `--exclude`?** In pack mode, PyArmor also obfuscates any imported module it finds under the
> current folder, and `.venv/` (and `app/frontend/node_modules/`) is under it. Without the excludes it tries to obfuscate libraries
> from your virtual environment and fails with `ERROR out of license` (a library module is "big"
> for the trial).
> **Expected:** PyInstaller's build log, then a `dist/run_api/` folder (about 35 MB) with the
> `run_api` executable and an `_internal/` folder that contains `pyarmor_runtime_000000/`.

Run the bundle:

```bash
./dist/run_api/run_api              # Windows: .\dist\run_api\run_api.exe
```

> **What it does:** starts the protected API from the bundle, with no Python environment needed.
> **Expected:** `Uvicorn running on http://127.0.0.1:8300`. In another terminal,
> `uv run python scripts/smoke.py --expect-build protected` passes.

> [!TIP]
> `--pack onefile` builds a single executable instead of a folder. It unpacks itself to a
> temporary folder at every start, so it starts more slowly. The workshop verified `onedir` on
> Windows with PyInstaller 6.22.3.

> [!WARNING]
> Like the protected build, a PyInstaller bundle is built for **one OS and one CPU architecture**.
> Build it on (or for) the platform you ship to. Bundles are also a common target for antivirus
> false positives; sign your executables in production (chapter 12).

Clean up: `rm -rf dist .pyarmor` (the `.pyarmor/` folder holds pack-mode work files).

## Which one?

| You ship to | Use |
|---|---|
| Servers you run | a Docker image (chapter 09) |
| A customer's server | a Docker image, or an archive and install instructions |
| Desktop users without Python | a PyInstaller bundle |

Next: [09 · Docker](09-docker.md)
