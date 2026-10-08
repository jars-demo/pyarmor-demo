# 01 · Project setup

> ⏱ 10 minutes · You will clone the repo, install everything in an isolated environment, and run
> the tests once.

## What you need

| Tool | Version | Used for |
|---|---|---|
| [Git](https://git-scm.com/downloads) | any recent | cloning the repository |
| [uv](https://docs.astral.sh/uv/getting-started/installation/) | 0.5 or newer | Python, virtual environment and dependencies, in one tool |
| [Docker](https://docs.docker.com/get-docker/) | 24 or newer | chapters 09 and 10 |

uv downloads the right Python for you. Prefer pip? Every step has a pip alternative below.

> [!NOTE]
> The project supports Python 3.10 to 3.13 and pins **3.12** in `.python-version`. That matters
> more than usual here: a PyArmor build only runs on the **same Python minor version** that built
> it. Chapter 06 shows what happens otherwise.

## 1. Clone the repository

```bash
git clone https://github.com/jars-demo/pyarmor-demo.git
cd pyarmor-demo
```

> **What it does:** downloads the repository and moves into it.
> **Why:** every command in this workshop runs from the repository root unless it says otherwise.
> **Expected:** a `pyarmor-demo/` folder with `app/`, `scripts/`, `tests/` and `workshop/` inside.

## 2. Create the environment and install dependencies

```bash
uv sync
```

> **What it does:** installs Python 3.12 if needed, creates `.venv/`, and installs the exact
> versions locked in `uv.lock`: FastAPI and uvicorn for the app, pytest and ruff for development,
> and PyArmor 9.2.7 for protection.
> **Why:** an isolated environment keeps PyArmor and the app's dependencies away from the rest of
> your machine, and the lockfile means everyone in the workshop runs the same versions.
> **Expected:** `Installed NN packages` and a new `.venv/` folder.

Without uv:

```bash
python -m venv .venv
source .venv/bin/activate           # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install --require-hashes -r requirements.txt
pip install pytest==9.1.1 httpx==0.28.1 ruff==0.16.10 pyarmor==9.2.7
```

(`requirements.txt` pins every runtime package with a hash, so it is installed on its own.)

With an activated environment, drop the `uv run` prefix from every command in this workshop.

## 3. Configure (optional)

```bash
cp .env.example .env
```

> **What it does:** copies the example settings: host, port (8300), log level and environment name.
> **Why:** every value has a sensible default, so this step is optional. It is here so you know
> where configuration lives: in the environment, never in the code.
> **Expected:** a `.env` file, which Git ignores.

## 4. Run the tests

```bash
uv run pytest
```

> **What it does:** runs the test suite against the original source.
> **Why:** this is your **baseline**. Later you run the very same tests against the protected
> build. If both pass, obfuscation did not change behaviour.
> **Expected:**
>
> ```text
> 38 passed in 0.15s
> ```

## 5. Start the API

```bash
uv run python -m app
```

> **What it does:** starts the FastAPI app with uvicorn on <http://127.0.0.1:8300>.
> **Why:** to check the app runs before you change anything.
> **Expected:** `Uvicorn running on http://127.0.0.1:8300`. Open <http://127.0.0.1:8300/docs> for
> the interactive API docs, then stop the server with **Ctrl+C**.

> [!TIP]
> Port 8300 taken? Set another one: `PYARMOR_DEMO_PORT=8301 uv run python -m app`
> (PowerShell: `$env:PYARMOR_DEMO_PORT=8301; uv run python -m app`).

Next: [02 · Explore the source](02-explore-source.md)
