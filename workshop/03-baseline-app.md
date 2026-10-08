# 03 · Baseline app

> ⏱ 10 minutes · You will call every endpoint and record the answers. Later, the protected build
> must give exactly the same ones.

## Start the API

In a first terminal:

```bash
uv run python -m app
```

> **What it does:** starts the original (unprotected) API on <http://127.0.0.1:8300>.
> **Why:** this is the reference behaviour for the rest of the workshop.
> **Expected:** `Uvicorn running on http://127.0.0.1:8300`. Leave it running.

Use a second terminal for the calls below. The examples use `curl`; on Windows, use `curl.exe`
in PowerShell (plain `curl` there is an alias for something else), or use the **Try it out**
buttons at <http://127.0.0.1:8300/docs>.

## GET /health

```bash
curl http://127.0.0.1:8300/health
```

> **What it does:** asks the API whether it is up.
> **Why:** health checks are what Docker, load balancers and reverse proxies use to decide whether
> to send traffic. You use this endpoint again in chapters 09 and 10.
> **Expected:** `{"status":"ok"}`

## GET /api/info

```bash
curl http://127.0.0.1:8300/api/info
```

> **What it does:** returns the app's name, version and, most importantly, which **build** is
> running.
> **Why:** `build` lets you tell the original from the protected app without guessing.
> **Expected:**
>
> ```json
> {"name":"Secret Analytics API","version":"0.1.0","build":"original","pyarmor_runtime":null,
>  "python":"3.12.x","environment":"development","endpoints":["GET /health", "..."]}
> ```

## POST /api/analyze

```bash
curl -X POST http://127.0.0.1:8300/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"customer_value": 75000, "risk_factor": 0.32, "engagement": 0.78}'
```

> **What it does:** runs the whole business logic on one customer: transform → risk score →
> business score → class → recommendation.
> **Why:** this is the protected logic at work, and these numbers are the contract the protected
> build must honour.
> **Expected:**
>
> ```json
> {"score":78.33,"risk_score":23.26,"classification":"strategic",
>  "recommendation":{"action":"assign-account-manager",
>    "message":"Assign a dedicated account manager and plan a quarterly review.",
>    "requires_review":false},
>  "features":{"value_index":0.8125,"engagement_index":0.9027}}
> ```

PowerShell users can send the same request with:

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8300/api/analyze -ContentType "application/json" `
  -Body '{"customer_value": 75000, "risk_factor": 0.32, "engagement": 0.78}'
```

Now try invalid input:

```bash
curl -i -X POST http://127.0.0.1:8300/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"customer_value": 75000, "risk_factor": 7, "engagement": 0.78}'
```

> **What it does:** sends a `risk_factor` outside the allowed 0 to 1 range.
> **Why:** input validation lives in `api/schemas.py`. Rejecting bad input early is a security
> control that works whether or not the code is obfuscated.
> **Expected:** status `422` (`HTTP/1.1 422 Unprocessable Entity` on Python 3.12), with a JSON
> message naming `risk_factor` and "less than or equal to 1".

## GET /api/report

```bash
curl http://127.0.0.1:8300/api/report
```

> **What it does:** summarises every analysis since the server started.
> **Why:** it shows the app keeps state in memory; restarting it resets the report.
> **Expected:** `{"analyses":1,"average_score":78.33,"by_classification":{"strategic":1},...}`
> (the rejected request is not counted).

## Check it all at once

```bash
uv run python scripts/smoke.py --expect-build original
```

> **What it does:** calls every endpoint and compares the answers with the known-good results above.
> **Why:** you use this exact check on the protected build, the PyInstaller bundle and the Docker
> container. One check, four builds.
> **Expected:** five ✓ lines and `Smoke test passed`.

Stop the server with **Ctrl+C**.

## What the logs say

Look at the server output: each analysis logged a line like
`INFO app.analytics analysis classification=strategic score=78.33`. The app deliberately logs the
**outcome** and never the raw inputs. Logs are read by more people and tools than code is, and
obfuscation does nothing for them. Chapter 11 comes back to this.

Next: [04 · Install PyArmor](04-pyarmor-setup.md)
