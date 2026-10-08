# 07 · Original vs protected

> ⏱ 15 minutes · You will put the two builds side by side: on disk, in Python's own tools, and in
> behaviour. Then you will read an honest list of what changed and what did not.

Make sure the protected build exists (`uv run python scripts/obfuscate.py`).

## On disk

| | Original `app/backend/business_logic/scoring.py` | Protected `build/protected/app/backend/business_logic/scoring.py` |
|---|---|---|
| Content | ~50 lines of readable Python | 3 lines: a comment, an import, one call with an encrypted blob |
| Function names | `calculate_risk_score`, `classify`, ... | not found as text |
| Weights and thresholds | `WEIGHTS = {"value": 0.55, ...}` | not found as text |
| Docstrings, comments | all there | comments gone; docstrings not found as text |

Check it yourself:

```bash
grep -c "WEIGHTS" app/backend/business_logic/scoring.py build/protected/app/backend/business_logic/scoring.py
```

> **What it does:** counts lines that mention `WEIGHTS` in each file.
> **Why:** a quick check that the name is gone from the protected file.
> **Expected:**
>
> ```text
> app/backend/business_logic/scoring.py:3
> build/protected/app/backend/business_logic/scoring.py:0
> ```

The [website's comparison view](https://pyarmor.jishanahmed.in/playground/) shows this module ("Secret Analytics: scoring.py") and
five other examples side by side, with real PyArmor output.

## In Python's own tools

```bash
cd build/protected
uv run python -c "import dis, app.backend.business_logic.scoring as s; dis.dis(s.classify)"
cd ../..
```

> **What it does:** tries to disassemble the protected `classify` function, as you did with the
> original in chapter 02.
> **Why:** `dis` reads bytecode. The original's bytecode named every variable and step.
> **Expected:** a few meaningless instructions (`NOP`, `NOP`, ...), then a crash inside `dis.py`
> with `IndexError: tuple index out of range`. While the function is not running, its bytecode is
> obfuscated and does not match its own tables.

Now run the runtime view on both builds:

```bash
uv run python scripts/runtime_view.py --dir build/protected
```

> **What it does:** imports the protected scoring module and prints what Python's normal
> introspection can still see, using only `vars()`, `inspect.signature()` and `__doc__`.
> **Why:** the files are protected, but the code has to be **loaded** to run. This shows what
> anyone who can run Python code next to your app can see once it is loaded.
> **Expected:**
>
> ```text
> Build  : protected (PyArmor)
>
> Can Python show a function's source code?
>   no: inspect.getsource() fails, the file on disk holds obfuscated bytes
>
> Visible at runtime anyway:
>   constant ENGAGEMENT_RISK_DAMPING = 0.35
>   constant WEIGHTS = {'value': 0.55, 'engagement': 0.45, 'risk_penalty': 0.3}
>   constant CLASS_THRESHOLDS = ((75.0, 'strategic'), (55.0, 'growth'), (35.0, 'nurture'), (0.0, 'watch'))
>   function calculate_risk_score(risk_factor: float, engagement: float) -> float
>            doc: Risk on 0..100. Engagement damps risk: an active customer is a safer customer.
>   ...
> ```

> [!IMPORTANT]
> The source code is gone, but **every value the module holds is still readable from inside the
> process**: the weights, the thresholds, function names, signatures and docstrings. The logic
> that *combines* them stays obfuscated; the data it uses does not. This is the difference between
> scenario B and scenario C from chapter 00.

### Private mode

PyArmor has an option for exactly this:

```bash
uv run pyarmor gen -O build/private -r --exclude app/frontend --private app
uv run python scripts/runtime_view.py --dir build/private
```

> **What it does:** builds with `--private`, which stops plain (unprotected) Python code from
> reading the protected modules' attributes, then runs the runtime view against that build.
> **Why:** to see one way PyArmor raises the bar against introspection.
> **Expected:** `RuntimeError: unauthorized use of script (1:5174)`. The protected API itself still
> works (we checked it with `scripts/smoke.py`).

Private mode has costs. Our own test suite is plain Python too, so it can no longer import the
protected modules: `verify.py --tests` fails on a private build. (`--restrict`, a stricter
mode, goes further and breaks `python -m app`, because Python's `runpy` is plain code.) And it
does not change the basic fact: inputs, outputs, logs, environment variables and memory all still
belong to whoever controls the machine. Clean up with `rm -rf build/private`.

## In behaviour

The protected build passed the same 36 tests and the same HTTP smoke test as the original, with
identical numbers. Nothing a client sees changed.

## What changed, what did not, and why it still works

| What changed | What did not change |
|---|---|
| Source text is gone from the files | The API: same endpoints, same responses |
| Bytecode is encrypted per module and per function | Results: identical, proven by the same tests |
| Each file needs the PyArmor runtime to load | Behaviour visible from outside: inputs, outputs, timing, logs |
| The build is tied to one Python version and platform | Values the code holds at runtime: constants, configuration |
| Optional: expiry and device binding | Your dependencies (FastAPI, pydantic) are not obfuscated |

**Why does it still work?** The runtime restores each module's code objects in memory when it is
imported, and each function's code while it runs. Python executes the same instructions as
before; they just are not stored readably on disk.

> [!NOTE]
> **Obfuscation is not encryption of your app.** PyArmor does use AES and RSA internally, but the
> key needed to run the code has to ship with the code, inside the runtime. Encryption protects
> data from people who do not have the key. Here, everyone who can run the app effectively has
> it. That is why obfuscation **raises the reverse-engineering effort** rather than guaranteeing
> secrecy.

Next: [08 · Packaging](08-packaging.md)
