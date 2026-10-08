# 02 · Explore the source

> ⏱ 10 minutes · You will read the app the way anyone with the files could, and find the parts
> worth protecting.

## The layout

```text
app/
├── __main__.py                  python -m app → starts uvicorn
├── backend/                     the FastAPI service: the code you will protect
│   ├── main.py                  create_app(): the FastAPI app factory. Start reading here.
│   ├── api/
│   │   ├── routes.py            the four endpoints; they validate and delegate, nothing more
│   │   └── schemas.py           request/response models (pydantic): bad input gets a 422
│   ├── core/
│   │   ├── config.py            settings from environment variables
│   │   └── build_info.py        tells the original build from the protected one
│   ├── services/
│   │   └── analytics.py         runs the business logic, keeps the in-memory report
│   └── business_logic/          ← the "intellectual property"
│       ├── transforms.py        proprietary_transform(): value and engagement curves
│       ├── scoring.py           calculate_risk_score(), calculate_business_score(), classify()
│       └── recommendations.py   generate_recommendation(): the action playbook
└── frontend/                    the workshop website (Next.js); never obfuscated or shipped with the API
```

The request flow is short:

```text
POST /api/analyze → routes.py → services/analytics.py → business_logic/* → JSON response
```

## Read the business logic

```bash
cat app/backend/business_logic/scoring.py
```

> **What it does:** prints the scoring module (Windows PowerShell: `Get-Content` works too).
> **Why:** to see how little effort it takes to read plain Python source.
> **Expected:** the full module, including these lines:
>
> ```python
> ENGAGEMENT_RISK_DAMPING = 0.35
> WEIGHTS = {"value": 0.55, "engagement": 0.45, "risk_penalty": 0.30}
> CLASS_THRESHOLDS = (
>     (75.0, "strategic"),
>     (55.0, "growth"),
>     ...
> ```

Those few lines **are** the model. With them, a competitor could rebuild your scoring in an
afternoon. Now look at the other two modules:

- `transforms.py`: `VALUE_CEILING`, and the S-curve that turns engagement into a feature
  (`ENGAGEMENT_MIDPOINT`, `ENGAGEMENT_STEEPNESS`)
- `recommendations.py`: the `PLAYBOOK` of actions, and the `HIGH_RISK` and `LOW_ENGAGEMENT`
  overrides

> [!NOTE]
> Every number here is invented for the workshop. There are no real secrets, credentials or
> customer data anywhere in this repository, and there should never be any in yours, protected or
> not. Chapter 11 explains why.

## Python can show its own source

```bash
uv run python scripts/runtime_view.py
```

> **What it does:** imports `app.backend.business_logic.scoring` and prints what Python's built-in
> introspection reveals about it.
> **Why:** this is the tool you run again in chapter 07 against the protected build, so you can
> compare the two.
> **Expected:**
>
> ```text
> Build  : original source
>
> Can Python show a function's source code?
>   yes: inspect.getsource(classify) returns it:
>     def classify(score: float) -> str:
>         """Name the band a business score falls in."""
>         ...
> Visible at runtime anyway:
>   constant ENGAGEMENT_RISK_DAMPING = 0.35
>   constant WEIGHTS = {'value': 0.55, 'engagement': 0.45, 'risk_penalty': 0.3}
>   ...
> ```

## Not only the source: bytecode too

Python compiles each module to bytecode and caches it in `__pycache__/*.pyc`. Shipping only
`.pyc` files is sometimes suggested as protection. It is not: bytecode keeps every name and
constant, and decompilers turn it back into readable Python.

```bash
uv run python -c "import dis, app.backend.business_logic.scoring as s; dis.dis(s.classify)"
```

> **What it does:** disassembles the `classify` function with Python's standard `dis` module.
> **Why:** to see that compiled bytecode still carries the names and the logic.
> **Expected:** instructions that name `CLASS_THRESHOLDS`, `threshold`, `label` and `score`.

Next: [03 · Baseline app](03-baseline-app.md)
