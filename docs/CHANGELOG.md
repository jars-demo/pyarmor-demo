# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

The first version of the workshop. Tested with PyArmor 9.2.7 (trial) on Python 3.12.

### Added

- **Secret Analytics API**: a FastAPI service (`app/backend`) with business logic worth
  protecting, and `/health`, `/api/info`, `/api/analyze` and `/api/report`. `/api/info` reports
  whether the original or the protected build is running.
- **Protection workflow**: `scripts/obfuscate.py` (runs `pyarmor gen` and fails on PyArmor errors,
  which PyArmor itself reports with exit status 0), `scripts/verify.py` (checks every module is
  obfuscated, the runtime is present and no source names survive, then runs the test suite against
  the protected build), `scripts/smoke.py` (HTTP check of any running instance) and
  `scripts/runtime_view.py` (what introspection still reveals at runtime).
- **Tests**: 38 tests with golden results, run against both the original and the protected build.
- **Docker**: a two-stage API image that obfuscates in the builder and ships no source, no tests and
  no PyArmor; non-root, root-owned code, hash-checked dependencies. `docker compose up` runs the API
  and the website, hardened and published on localhost only.
- **PyInstaller packaging**: `run_api.py` and a verified `pyarmor gen --pack onedir` workflow.
- **Deployment template** (`deploy/`): the API behind Caddy with automatic HTTPS, health checks,
  log rotation and an internal network.
- **Workshop**: 13 chapters, from the threat model to a production checklist, every command with
  what it does, why, and the expected output.
- **Website** (`app/frontend`): Next.js static site with the workshop, Learn, a before/after
  Playground of real PyArmor output, a live Lab that calls the local API, Architecture, Security
  Model and FAQ pages; light and dark themes; deployable to Vercel as a static site.
- **CI**: lint, tests, protected build and verification, Docker smoke tests and image checks, SBOM,
  vulnerability scanning, dependency audit, and website builds.
