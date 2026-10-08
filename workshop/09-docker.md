# 09 · Docker

> ⏱ 20 minutes · You will build a two-stage image that obfuscates in the first stage and ships
> only the protected build, then inspect it the way someone who receives the image would.

## The idea

```text
Stage 1: builder (python:3.12-slim)          Stage 2: runtime (python:3.12-slim)
  requirements.txt → /opt/venv  ───────────────→  /opt/venv          (dependencies)
  pip install pyarmor                             (no PyArmor)
  COPY app/  (source)                             (no source)
  scripts/obfuscate.py → build/protected ──────→  /srv/app           (protected code + runtime)
  scripts/verify.py                               USER app, HEALTHCHECK, CMD python -m app
```

Only what is explicitly copied from the builder reaches the final image. The source, PyArmor and
the builder's layers are left behind.

Read the [`Dockerfile`](../app/backend/Dockerfile) now. It is short and every line has a comment. Points to
notice:

- **Same base image in both stages.** The protected build only runs on the Python version that
  built it.
- **`pip install --require-hashes`.** Every dependency must match the hash in `requirements.txt`.
- **PyArmor is installed outside `/opt/venv`,** so it cannot leak into the runtime image.
- **`obfuscate.py && verify.py`** fail the build if PyArmor refuses a module or the output is not
  fully obfuscated.
- **A non-root user** (`app`, uid 10001) runs the app. The code is owned by root, so the app
  cannot change it.

And its ignore file, [`Dockerfile.dockerignore`](../app/backend/Dockerfile.dockerignore), is an
**allowlist**: only the Python parts of `app/`, two scripts and `requirements.txt` are sent to
Docker. `.git`, `.env`, `tests/`, `workshop/` and the website in `app/frontend/` never even reach
the builder.

## Build the image

```bash
docker build -f app/backend/Dockerfile -t pyarmor-demo:local .
```

> **What it does:** runs both stages and tags the result `pyarmor-demo:local`.
> **Why:** obfuscating inside the builder means the build happens on Linux with the exact Python
> the image runs, wherever you start it from.
> **Expected:** the PyArmor log and the verification ticks scroll past inside the build, then
> `naming to docker.io/library/pyarmor-demo:local`.
>
> ```text
> #15 0.960 INFO     obfuscate scripts OK
> #15 1.125   ✓ every module is obfuscated and present
> #15 1.125   ✓ the PyArmor runtime is present
> #15 1.125   ✓ no function names, constant names or long strings found as plain text
> ```

> [!NOTE]
> Each `docker build` runs the PyArmor trial in a fresh container. PyArmor's terms allow the trial
> in local Docker builds "less than 100 runs per month"; Docker's layer cache skips the step when
> `app/backend/` has not changed.

## Run it

```bash
docker compose up -d --build
```

> **What it does:** starts two containers from [`docker-compose.yml`](../docker-compose.yml):
> `api` (the protected image you just built, on port 8300) and `web` (this workshop's website on
> port 3300, served by nginx, which forwards `/api` to the `api` container). Both are published on
> **localhost only**, with a read-only filesystem, all Linux capabilities dropped, and
> `no-new-privileges`.
> **Why:** these settings cost nothing and limit what a compromised process could do.
> **Expected:** `Container pyarmor-demo-api-1  Healthy`, then `Container pyarmor-demo-web-1  Started`.
> Open <http://localhost:3300/lab/>: the badge says **Protected build**.

```bash
uv run python scripts/smoke.py --expect-build protected
docker compose ps
```

> **Expected:** `Smoke test passed`, and `api` shows `Up ... (healthy)`.
> The health status comes from the `HEALTHCHECK` in the Dockerfile, which calls `/health`.

## Inspect the image: what does the recipient actually get?

Imagine you shipped this image to a customer. What can they see?

### The files

```bash
docker run --rm --entrypoint find pyarmor-demo:local /srv/app -type f
```

> **What it does:** starts a throwaway container that lists every file in the app folder, instead
> of starting the API.
> **Why:** anyone who has an image can do this. It needs no special tools.
> **Expected:** 16 obfuscated `.py` files under `/srv/app/app/` and the runtime
> (`pyarmor_runtime_000000/__init__.py` and `pyarmor_runtime.so`). Nothing else.

> [!TIP]
> In Git Bash on Windows, prefix Docker commands that contain `/paths` with `MSYS_NO_PATHCONV=1`,
> or Git Bash rewrites them into Windows paths. PowerShell, macOS and Linux need nothing.

### No source, no PyArmor, no build leftovers

```bash
docker run --rm --entrypoint sh pyarmor-demo:local -c 'ls /src; which pyarmor; head -c 150 /srv/app/app/backend/business_logic/scoring.py'
```

> **What it does:** looks for the builder's source folder and the PyArmor CLI, and prints the
> start of the protected scoring module.
> **Expected:**
>
> ```text
> ls: cannot access '/src': No such file or directory
> # Pyarmor 9.2.7 (trial), 000000, non-profits, 2026-10-08T09:17:16.748765
> from pyarmor_runtime_000000 import __pyarmor__
> __pyarmor__(__name__, __file__, b'PY0000...
> ```

Notice what the **header** gives away: the PyArmor version, the license type (`trial`) and the
build time. That is not secret, but it is information: it tells an analyst which tool and version
to study.

### The layers

```bash
docker history pyarmor-demo:local
```

> **What it does:** lists the layers of the final image and the instruction that made each one.
> **Why:** layers are how images are stored and shipped. Anything ever added in a layer of the
> final image stays inside it, even if a later step deletes it.
> **Expected:** the runtime stage only: `COPY /opt/venv` (~27 MB), `COPY /src/build/protected`
> (~0.9 MB), the user, `HEALTHCHECK` and `CMD`. None of the builder's steps (`pip install pyarmor`,
> `COPY app`, the obfuscation run) appear, because they were never part of this image.

### The configuration

```bash
docker image inspect pyarmor-demo:local --format '{{json .Config.Env}}'
```

> **What it does:** prints the environment variables baked into the image.
> **Why:** this is where people accidentally ship secrets.
> **Expected:** `PATH`, `PYTHON_VERSION`, and the four `PYARMOR_DEMO_*` settings. All harmless.

> [!WARNING]
> Every `ENV` and `ARG` value, every file and every layer of an image can be read by anyone who has
> the image. **Never put a secret in a Dockerfile**, an image, or protected code. Pass secrets at
> runtime from a secrets manager (chapter 12).

### Inside the running container

```bash
docker compose exec api sh -c 'id; touch /srv/app/test'
```

> **What it does:** shows which user the app runs as, and tries to write into the code folder.
> **Expected:**
>
> ```text
> uid=10001(app) gid=10001(app) groups=10001(app)
> touch: cannot touch '/srv/app/test': Read-only file system
> ```

Hold on to that thought: `docker compose exec` gave you a shell **inside the running app's
container**. That is scenario C from chapter 00, and chapter 11 is about what it means.

### Image size

```bash
docker image ls pyarmor-demo:local
```

> **Expected:** about 150 MB: the slim Python base image (~120 MB), the dependencies (~27 MB) and the
> protected app (under 1 MB).

Stop the stack when you are done:

```bash
docker compose down
```

Next: [10 · Deployment](10-deployment.md)
