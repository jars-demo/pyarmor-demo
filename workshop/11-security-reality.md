# 11 · Security reality check

> ⏱ 15 minutes · No new tools. You will put everything you saw together and leave with an accurate
> model of what obfuscation protects, and what it does not.

## Four things obfuscation is not

| | Why not |
|---|---|
| **Obfuscation ≠ encryption** | Encryption keeps data from people **without the key**. Protected code must run, so the means to decode it ships with it, inside the runtime. Everyone who can run your app can, in principle, decode it. |
| **Obfuscation ≠ DRM** | Expiry and device binding are enforced by the runtime, on a machine the user controls. They stop casual misuse and honest mistakes, not a determined attacker who controls the clock and the hardware. |
| **Obfuscation ≠ absolute secrecy** | It **raises the effort** needed to understand and reuse your logic. Effort is a cost, not a wall: enough time and skill get through. |
| **Obfuscation ≠ a secure server** | It does nothing for open ports, weak passwords, unpatched dependencies, leaked keys, or who can SSH into the machine. |

## Back to the three scenarios, with evidence

| | Scenario A: source available | Scenario B: protected artifact | Scenario C: attacker controls execution |
|---|---|---|---|
| Read the logic from files | **trivial** (ch 02) | **not found as text** (ch 05, 07) | not from files... |
| Read constants and names | trivial | not from the files | **yes, from the running process** (ch 07, `runtime_view.py`) |
| Learn behaviour from inputs/outputs | yes | yes | yes |
| Read secrets you passed in | yes | yes | **yes** |
| Copy-paste your code into a product | trivial | **hard** | hard, but they can run *your* build |
| Severity | 🔴 nothing protected | 🟡 logic protected against casual and moderate effort | 🔴 obfuscation is not the boundary |

In scenario C, you already saw it yourself in this workshop:

- `docker compose exec api sh` gave you **a shell inside the running app's container** (ch 09).
- `runtime_view.py` read every weight and threshold **from memory** with Python's ordinary
  introspection (ch 07). Private mode (`--private`) blocks that particular route, but not the
  ones below.

## What an attacker with access can still learn

Here is what remains observable, so you know what to protect by other means. Obfuscation changes
none of these rows.

| Channel | What it reveals | What actually protects it |
|---|---|---|
| **Inputs and outputs** | Call `/api/analyze` enough times and the scoring curve can be approximated without any code at all. | Authentication, rate limiting, monitoring for scraping patterns |
| **Logs** | Whatever you log. This app logs outcomes, never inputs, on purpose (ch 03). | Log less; restrict who reads logs; never log secrets or personal data |
| **Runtime behaviour** | Timing, errors and which endpoints exist (`/docs` publishes the whole API schema). | Generic error messages; disable `/docs` in production if the API is private |
| **Filesystem** | Every file the app can read: configuration, certificates, data. | Least privilege; mount secrets read-only and only where needed |
| **Environment variables** | Visible to anyone with a shell in the container, and via `docker inspect`. | A secrets manager; short-lived credentials |
| **Dependencies** | FastAPI, pydantic and uvicorn are **not obfuscated**; neither is their behaviour. | Keep them patched; scan them (ch 12) |
| **Process access** | A process's memory holds decoded code objects, constants and every secret it uses. | Keep attackers off the host: access control, isolation, patching |
| **Memory and runtime analysis** | Debuggers and memory inspection see what the CPU sees. PyArmor's own FAQ says it is "not good at memory protection and anti-debug". | The same: protect the environment, not just the code |
| **Container access** | Image layers, `ENV` values, and every file in the image (ch 09). | Private registries, signed images, no secrets in images |

> [!WARNING]
> **Never put API keys, passwords or tokens in code, protected or not.** The code has to *use* the
> secret, so the secret exists in plain form in memory at runtime, and often in requests, logs and
> error reports too. Obfuscation hides how your code is written, not the values it works with.

## What the vendor claims, and what to take from it

PyArmor's FAQ states that obfuscated scripts "can't be restored by any way". Read that narrowly:
it is about recovering your **original source text** from the files, which this workshop did not
contradict. It is not a claim that your **logic, data or secrets** stay hidden from someone who runs
the code, and the same FAQ notes the limits on memory protection and anti-debugging.

## So when is PyArmor worth it?

**Good fits** (scenario B, where obfuscation is a sensible layer):

- Software delivered to customers who run it on their machines: on-premises products, desktop
  tools, SDKs with commercial logic
- Containers shipped to partners, where you want to discourage casual reading and copying
- Time-limited trial or evaluation builds (`-e`), and builds tied to known hardware (`-b`)

**Poor fits** (where it adds little):

- Code that only runs on **your own servers**. Nobody receives the code, so it is the server's
  access control that matters, not obfuscation.
- Protecting **secrets**. Use a secrets manager.
- Anything where losing the logic would be catastrophic. Keep that logic on a server you control
  and expose it as an API, so the code never leaves your hands.

> [!IMPORTANT]
> **The strongest security boundary is not obfuscation alone.** Protect the environment, secrets,
> identity, deployment, infrastructure and release pipeline as well. Obfuscation raises the cost of
> reading what you ship. Everything else decides who gets to run it, and where.

Next: [12 · Production best practices](12-best-practices.md)
