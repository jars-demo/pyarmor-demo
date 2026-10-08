# 00 · Introduction and threat model

> ⏱ 10 minutes · No commands yet: this chapter sets up the ideas the rest of the workshop tests.

## What is Python code protection?

Python is usually shipped as **source code**. When you `pip install` a package or copy an app onto
a server, the `.py` files are right there, and anyone with access to them can read every function,
constant and comment. Even the compiled `.pyc` files that Python caches can be turned back into
readable code with freely available tools.

That is fine for open-source software. It is a problem when the code itself is what you sell: a
pricing model, a scoring algorithm, a set of rules you spent a year tuning.

**Code protection** is the set of techniques that make shipped code harder to read, copy or
change. **Obfuscation** is one of them: it transforms the code so it still runs, but no longer
reads like the original.

## What PyArmor does

[PyArmor](https://pyarmor.readthedocs.io/) obfuscates Python scripts and packages. It rewrites each
`.py` file into a small stub that hands an encrypted, transformed payload to a **runtime
extension** (a compiled binary, `pyarmor_runtime`). The runtime restores and runs the code inside
the Python process, as it is needed.

```text
your source  →  pyarmor gen  →  protected .py files  +  pyarmor_runtime package  →  runs as before
```

## What it solves, and what it does not

| PyArmor helps with | PyArmor does **not** solve |
|---|---|
| Casual reading of your shipped code | Secrets in your code (API keys, passwords): they are still used at runtime |
| Copy-pasting your logic into another product | An attacker with shell access to the machine running your code |
| Raising the effort to understand your algorithm | Logic that can be learned from inputs and outputs |
| Limiting where and how long a build runs (expiry, device binding) | Server security, access control, secrets management |

> [!IMPORTANT]
> Obfuscation **raises the effort** needed to understand and reuse your code. It does not make
> that effort infinite. Treat it as one layer of defence, never as the security boundary.

## Threat model: three scenarios

Who can see what decides how much obfuscation helps. Keep these three in mind for the whole
workshop; [chapter 11](11-security-reality.md) comes back to them with evidence.

### Scenario A: public source

**The attacker has** your Git repository, or a package with plain `.py` files.
**Protection:** none. Reading the code takes seconds, and so does copying it.

### Scenario B: a protected application

**The attacker receives** your protected build: obfuscated `.py` files and the PyArmor runtime,
for example inside a Docker image or an installer you shipped.
**Protection:** real. There is no readable source in the files. To learn your logic, the attacker
must run it and study its behaviour, or put serious work into reverse engineering. Obfuscation
raises the cost of copying your work.

### Scenario C: the attacker controls the execution environment

**The attacker has** shell access to the server or container, the filesystem, the running
process, the logs, environment variables, and network traffic.
**Protection:** limited. Your code must be decoded to run, and it runs on *their* machine. They
can call your functions, read every value the program holds in memory, watch every input and
output, and read every secret you passed in.

> [!WARNING]
> If an attacker controls the machine where software executes, **no Python obfuscator should be
> presented as an absolute security boundary**. Protect the environment itself: access control,
> secrets management, hardened containers, and a trusted release pipeline.

## What you will build

1. Run **Secret Analytics API**, a small FastAPI app with business logic worth protecting.
2. Read its source, then protect it with **PyArmor 9.2.7**.
3. Break and repair the **runtime**, and set an **expiry date** on a build.
4. Prove the protected build gives **exactly the same results**, with the same tests.
5. Bundle it with **PyInstaller**, then ship it in a **Docker image** that has no source in it.
6. Inspect that image the way an attacker would, and see what obfuscation can and cannot hide.
7. Deploy it behind HTTPS, and leave with a checklist for production.

Next: [01 · Project setup](01-project-setup.md)
