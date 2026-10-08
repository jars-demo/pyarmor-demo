# 12 · Production best practices

> ⏱ 15 minutes · A checklist for shipping protected Python, in the order things usually go wrong.
> Each item says where this repository already does it.

## Secrets

- [ ] **No secrets in code, images, Dockerfiles or Git.** This repository has none: `.env` is ignored,
  `.env.example` holds only harmless defaults.
- [ ] **Use a secrets manager** (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault,
  HashiCorp Vault, Doppler, or Docker/Kubernetes secrets) and inject secrets at runtime.
- [ ] **Prefer short-lived, narrowly scoped credentials**, and rotate them. A leaked token that
  expires in an hour is a much smaller problem.
- [ ] **Environment variables are acceptable for configuration**, not ideal for secrets: they show
  up in `docker inspect`, `/proc`, crash reports and child processes. Mounted secret files
  (`/run/secrets/...`) are a step better.

## Least privilege and container hardening

- [ ] **Run as a non-root user.** ✓ `USER app` (uid 10001) in the `Dockerfile`.
- [ ] **Code is read-only to the app.** ✓ root-owned files, plus `read_only: true` in compose.
- [ ] **Drop capabilities, forbid privilege escalation.** ✓ `cap_drop: [ALL]`,
  `no-new-privileges:true`.
- [ ] **Publish only what is needed.** ✓ `127.0.0.1:8300` locally; no published port behind
  Caddy (`deploy/`).
- [ ] **Small images.** ✓ `python:3.12-slim`, multi-stage, no build tools in the final image.
- [ ] **Pin the base image by digest** for reproducible builds:
  `FROM python:3.12-slim@sha256:...` (the `Dockerfile` explains how).

## Filesystem permissions

- [ ] Application code: owned by root, readable by the app user, writable by nobody at runtime.
- [ ] Writable paths: only what the app needs (`/tmp` as tmpfs here), never the code folder.
- [ ] Secret files: mode `0400`, readable only by the app user.

## Dependencies

- [ ] **Pin exact versions.** ✓ `pyproject.toml` pins direct dependencies; `uv.lock` and
  `requirements.txt` pin everything.
- [ ] **Verify hashes.** ✓ `pip install --require-hashes` in the `Dockerfile`.
- [ ] **Scan for known vulnerabilities**, in CI and on a schedule:

```bash
uvx pip-audit -r requirements.txt
```

> **What it does:** checks every pinned package against the Python Packaging Advisory Database.
> **Expected:** `No known vulnerabilities found`, or a list of packages and fixed versions.

- [ ] **Update deliberately**: one dependency per change, with tests (the
  [`dependency-update`](https://github.com/jars-demo/jars-skills/tree/main/skills/dependency-update)
  skill describes a safe routine). Remember to regenerate `requirements.txt`:
  `uv export --frozen --no-default-groups --no-emit-project --format requirements-txt -o requirements.txt`.

## Image scanning and SBOM

- [ ] **Scan the image**, not just your Python packages: the base image has system packages too.
  ✓ CI scans with [Trivy](https://trivy.dev/) (see `.github/workflows/ci.yml`).
- [ ] **Produce an SBOM** (software bill of materials), so you can answer "are we affected?" the day
  a new vulnerability is announced. ✓ CI generates an SPDX SBOM with
  [Syft](https://github.com/anchore/syft) and keeps it as a build artifact.

Locally, with Docker:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.69.3 image --severity HIGH,CRITICAL pyarmor-demo:local
```

> **What it does:** scans the image's OS packages and Python packages for known HIGH and CRITICAL
> vulnerabilities.
> **Expected:** a table per layer type; ideally `Total: 0`. Findings in the base image are usually
> fixed by rebuilding on a newer `python:3.12-slim`.

## CI/CD protection

- [ ] **Build protected artifacts in CI**, not on a laptop, so every release is reproducible and
  reviewed. ✓ CI obfuscates, verifies and smoke-tests on every push.
- [ ] **PyArmor licenses are CI secrets.** Never commit a registration file. If you use a paid
  license in CI, store the regfile as an encrypted GitHub secret, write it to a temporary file in
  the job, and run `pyarmor reg` there. Note that PyArmor's CI license sends some runner details to
  its license server, and has rate limits. Read the [license
  page](https://pyarmor.readthedocs.io/en/latest/licenses.html).
- [ ] **Least-privilege CI tokens.** ✓ `permissions: contents: read` in the workflow.
- [ ] **Pin third-party actions** to a release (better: a commit SHA), and review updates.
- [ ] **Protect the main branch**: required reviews and required checks.

## Private package repositories and artifact integrity

- [ ] Publish protected images to a **private registry** (GHCR, ECR, Artifact Registry) with
  access control, never to a public one if the logic matters.
- [ ] If you distribute wheels, use a **private package index** (an Artifactory, Nexus or cloud
  equivalent) rather than a public PyPI project.
- [ ] **Publish checksums** (`sha256sum`) for every downloadable artifact.

## Signed releases

- [ ] **Sign container images** and verify signatures before deployment, for example with
  [Sigstore cosign](https://docs.sigstore.dev/): `cosign sign` in CI, `cosign verify` at deploy.
- [ ] **Sign executables** (Windows Authenticode, Apple notarisation) for PyInstaller bundles.
- [ ] **Sign Git tags** for releases.

## Server access controls

- [ ] SSH keys only, no passwords; restricted to known addresses or a VPN or bastion.
- [ ] Separate accounts, no shared root; every privileged action is logged.
- [ ] A firewall that allows only the ports you serve (here: 80, 443).
- [ ] Automatic security updates for the host OS.
- [ ] Monitoring and alerting on health checks and unusual traffic.

## Where PyArmor fits

| Control | Protects against |
|---|---|
| **PyArmor** | casual reading and copying of the code you **ship** (scenario B) |
| Secrets manager | leaked credentials |
| Access control, network policy | strangers reaching the environment (scenario C) |
| Container hardening | a compromised process doing more damage |
| Dependency and image scanning | known vulnerabilities in what you did not write |
| Signed artifacts, protected CI | tampered or unofficial builds |

Use PyArmor when you ship code to environments you do not control and the logic is worth
protecting. Use all the rest regardless.

---

That is the workshop. You protected an application, proved it still works, shipped it in a
container with no source, and saw exactly where obfuscation stops. Questions or improvements are
welcome: see [Contributing](../README.md#contributing) in the README.
