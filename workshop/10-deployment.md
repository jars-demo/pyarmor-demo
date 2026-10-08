# 10 · Deployment

> ⏱ 15 minutes (reading), longer if you deploy to a real server · You will see how the protected
> container runs in production: behind a reverse proxy with HTTPS, with health checks, logs and a
> restart policy.

There is no public instance of the API: everything here runs on your machine or a server you
provide.

## The production shape

```text
client ──HTTPS──▶ Caddy (ports 80/443) ──HTTP, internal network──▶ api container (port 8300)
                   │ certificates (Let's Encrypt)                      │ protected app
                   │ security headers, compression                    │ non-root, read-only
                   │ health checks /health                            │ HEALTHCHECK
                   └ JSON access logs                                 └ app logs to stdout
```

| Concern | How the template handles it |
|---|---|
| **Container** | the same image as chapter 09, built from the same `Dockerfile` |
| **Port** | the API has **no published port**. Only Caddy reaches it, over an internal Docker network |
| **Reverse proxy** | [Caddy](https://caddyserver.com/) forwards requests to `api:8300` |
| **HTTPS** | Caddy gets and renews Let's Encrypt certificates for `API_DOMAIN` automatically, and redirects HTTP to HTTPS |
| **Environment variables** | `PYARMOR_DEMO_ENV=production`, log level from `deploy/.env`. No secrets are needed |
| **Health checks** | the image's `HEALTHCHECK`; Caddy starts only once the API is healthy and stops routing to it while `/health` fails |
| **Logs** | both containers log to stdout; Docker rotates them (10 MB × 5 files) |
| **Restart policy** | `unless-stopped`: restarts after crashes and reboots, not after `docker compose stop` |

## Try it locally

You can run the whole production stack on your machine. With `API_DOMAIN=localhost`, Caddy uses
its own local certificate authority instead of Let's Encrypt.

```bash
API_DOMAIN=localhost docker compose -f deploy/docker-compose.yml up -d --build
```

(PowerShell: `$env:API_DOMAIN="localhost"; docker compose -f deploy/docker-compose.yml up -d --build`)

> **What it does:** builds the image and starts the API and Caddy.
> **Why:** to see the production layout working before you touch a server.
> **Expected:** `Container pyarmor-demo-prod-api-1  Healthy`, then the Caddy container starts.

> [!NOTE]
> Caddy needs ports 80 and 443 on your machine. If something else uses them, stop it first.

```bash
curl -k https://localhost/health
curl -k -i https://localhost/api/info
curl -m 3 http://localhost:8300/health
```

> **What it does:** calls the API through Caddy over HTTPS (`-k` accepts Caddy's local
> certificate), shows a response with its headers (`-i`), then tries to reach the API **directly**.
> **Expected:** `{"status":"ok"}`; headers including `Strict-Transport-Security` and
> `X-Content-Type-Options: nosniff`; and the direct call **fails**, because the API is only
> reachable through the proxy.

```bash
docker compose -f deploy/docker-compose.yml logs caddy
docker compose -f deploy/docker-compose.yml down
```

> **What it does:** shows Caddy's JSON access logs, then stops and removes the stack.

## On a real server

> [!IMPORTANT]
> This is a template, tested end to end on `localhost`. A real deployment depends on your server,
> DNS and firewall; adapt it rather than copying it blindly.

1. A Linux server with Docker, and a DNS name (for example, `api.example.com`) whose A/AAAA record
   points at it.
2. A firewall that allows only 22 (SSH, ideally from known addresses), 80 and 443.
3. On the server:

```bash
git clone https://github.com/jars-demo/pyarmor-demo.git && cd pyarmor-demo
cp deploy/.env.example deploy/.env       # set API_DOMAIN=api.example.com
docker compose -f deploy/docker-compose.yml up -d --build
```

> **What it does:** builds the protected image **on the server** and starts the stack.
> **Expected:** within a minute, `https://api.example.com/health` returns `{"status":"ok"}` with a
> valid certificate.

Building on the server means the source reaches the server. Often that is fine: it is your server.
If it is not (the "customer's server" case), build the image in CI, push it to a private registry,
and change `build: ..` to `image: your-registry/pyarmor-demo:1.2.3` so the server only pulls the
protected image. Chapter 12 covers signing that image.

Day-2 commands:

```bash
docker compose -f deploy/docker-compose.yml ps          # health status
docker compose -f deploy/docker-compose.yml logs -f api # follow app logs
git pull && docker compose -f deploy/docker-compose.yml up -d --build   # update
```

Next: [11 · Security reality check](11-security-reality.md)
