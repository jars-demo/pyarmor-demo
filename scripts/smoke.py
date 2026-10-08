"""Smoke-test a running Secret Analytics API over HTTP.

    python scripts/smoke.py                                    # http://localhost:8300
    python scripts/smoke.py --url http://localhost:8300 --expect-build protected

Waits for /health, then calls every endpoint and compares the answers with known-good results.
Use it on the original app, the protected build, or the Docker container: it only speaks HTTP.
Standard library only.
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.request

SAMPLE = {"customer_value": 75000, "risk_factor": 0.32, "engagement": 0.78}
EXPECTED = {"score": 78.33, "risk_score": 23.26, "classification": "strategic"}


def call(url: str, body: dict | None = None) -> tuple[int, dict]:
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, json.load(error)


def wait_for(url: str, seconds: float) -> bool:
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        try:
            if call(f"{url}/health")[0] == 200:
                return True
        except OSError:
            pass
        time.sleep(1)
    return False


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument("--url", default="http://localhost:8300")
    parser.add_argument("--expect-build", choices=["original", "protected"])
    parser.add_argument("--wait", type=float, default=30, help="seconds to wait for /health")
    args = parser.parse_args()
    url = args.url.rstrip("/")

    if not wait_for(url, args.wait):
        print(f"✗ {url}/health did not answer within {args.wait:.0f}s")
        return 1
    print(f"✓ GET  /health        200 at {url}")

    failures = []
    _, info = call(f"{url}/api/info")
    print(f"✓ GET  /api/info      build={info['build']} runtime={info['pyarmor_runtime']}")
    if args.expect_build and info["build"] != args.expect_build:
        failures.append(f"expected build {args.expect_build!r}, got {info['build']!r}")

    status, result = call(f"{url}/api/analyze", SAMPLE)
    got = {key: result.get(key) for key in EXPECTED}
    print(f"{'✓' if got == EXPECTED else '✗'} POST /api/analyze   {status} {got}")
    if status != 200 or got != EXPECTED:
        failures.append(f"analyze returned {status} {got}, expected {EXPECTED}")

    status, _ = call(f"{url}/api/analyze", {**SAMPLE, "risk_factor": 5})
    print(f"{'✓' if status == 422 else '✗'} POST /api/analyze   {status} for invalid input")
    if status != 422:
        failures.append(f"invalid input returned {status}, expected 422")

    status, report = call(f"{url}/api/report")
    print(f"✓ GET  /api/report    {status} analyses={report.get('analyses')}")
    if status != 200 or not report.get("analyses"):
        failures.append("report did not count the analysis")

    for failure in failures:
        print(f"✗ {failure}")
    print("Smoke test " + ("FAILED" if failures else "passed"))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
