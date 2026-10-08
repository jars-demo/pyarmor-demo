# syntax=docker/dockerfile:1
#
# Two stages. The builder has the source and PyArmor and produces the protected build; the runtime
# image gets only that build and the runtime dependencies. No source, no tests, no PyArmor.
#
#   docker build -f app/backend/Dockerfile -t pyarmor-demo .      (from the repository root)
#   docker run --rm -p 127.0.0.1:8300:8300 pyarmor-demo
#
# PyArmor output only runs on the Python version that built it, so both stages use the same image.
# For reproducible production builds, pin it by digest too (python:3.12-slim@sha256:...).
ARG PYTHON_IMAGE=python:3.12-slim

# ---------------------------------------------------------------------------------------------
# Stage 1: builder. Source in, protected build out.
# ---------------------------------------------------------------------------------------------
FROM ${PYTHON_IMAGE} AS builder

ARG PYARMOR_VERSION=9.2.7
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_ROOT_USER_ACTION=ignore \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /src

# Runtime dependencies go into their own virtual environment, which the runtime stage copies.
# --require-hashes: every package must match the hash in requirements.txt, or the build stops.
COPY requirements.txt .
RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --require-hashes -r requirements.txt

# PyArmor goes into the builder's system Python, never into /opt/venv, so it cannot reach the
# runtime image. The trial version is used here; see workshop/04-pyarmor-setup.md for licensing.
RUN pip install "pyarmor==${PYARMOR_VERSION}"

COPY app/__init__.py app/__main__.py ./app/
COPY app/backend ./app/backend
COPY scripts/obfuscate.py scripts/verify.py ./scripts/

# Obfuscate, then check the result. Either step fails the build if something is wrong.
RUN python scripts/obfuscate.py && python scripts/verify.py

# ---------------------------------------------------------------------------------------------
# Stage 2: runtime. Only the protected build and what it needs to run.
# ---------------------------------------------------------------------------------------------
FROM ${PYTHON_IMAGE} AS runtime

LABEL org.opencontainers.image.title="pyarmor-demo" \
      org.opencontainers.image.description="Secret Analytics API, protected with PyArmor" \
      org.opencontainers.image.source="https://github.com/jars-demo/pyarmor-demo" \
      org.opencontainers.image.licenses="MIT"

ENV PATH=/opt/venv/bin:$PATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYARMOR_DEMO_HOST=0.0.0.0 \
    PYARMOR_DEMO_PORT=8300 \
    PYARMOR_DEMO_ENV=production

# An unprivileged user with no home and no login shell runs the app.
RUN groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app

COPY --from=builder /opt/venv /opt/venv
# Owned by root and read-only to the app user: the running process cannot change its own code.
COPY --from=builder /src/build/protected /srv/app

WORKDIR /srv/app
USER app
EXPOSE 8300

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8300/health', timeout=2)"]

CMD ["python", "-m", "app"]
