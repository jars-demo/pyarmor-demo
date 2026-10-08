"""The HTTP API, end to end through FastAPI's test client."""

import pytest

SAMPLE = {"customer_value": 75000, "risk_factor": 0.32, "engagement": 0.78}


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_info(client, expected_build):
    body = client.get("/api/info").json()
    assert body["name"] == "Secret Analytics API"
    assert body["build"] in {"original", "protected"}
    assert body["environment"] == "test"
    assert "POST /api/analyze" in body["endpoints"]
    if body["build"] == "protected":
        assert body["pyarmor_runtime"].startswith("pyarmor_runtime_")
    if expected_build:
        assert body["build"] == expected_build


def test_analyze(client):
    response = client.post("/api/analyze", json=SAMPLE)
    assert response.status_code == 200
    body = response.json()
    assert body["score"] == 78.33
    assert body["risk_score"] == 23.26
    assert body["classification"] == "strategic"
    assert body["recommendation"] == {
        "action": "assign-account-manager",
        "message": "Assign a dedicated account manager and plan a quarterly review.",
        "requires_review": False,
    }
    assert set(body["features"]) == {"value_index", "engagement_index"}


@pytest.mark.parametrize(
    "payload",
    [
        {**SAMPLE, "risk_factor": 1.5},
        {**SAMPLE, "engagement": -0.1},
        {**SAMPLE, "customer_value": -1},
        {**SAMPLE, "customer_value": "a lot"},
        {"customer_value": 75000, "risk_factor": 0.32},
        {**SAMPLE, "unexpected": True},
    ],
    ids=[
        "risk>1",
        "engagement<0",
        "negative-value",
        "not-a-number",
        "missing-field",
        "extra-field",
    ],
)
def test_analyze_rejects_invalid_input(client, payload):
    assert client.post("/api/analyze", json=payload).status_code == 422


def test_report_starts_empty(client):
    assert client.get("/api/report").json() == {
        "analyses": 0,
        "average_score": None,
        "by_classification": {},
        "last_analysis_at": None,
    }


def test_report_counts_analyses(client):
    client.post("/api/analyze", json=SAMPLE)
    client.post("/api/analyze", json={"customer_value": 0, "risk_factor": 0, "engagement": 0})
    client.post("/api/analyze", json={**SAMPLE, "risk_factor": 2})  # rejected, not counted
    body = client.get("/api/report").json()
    assert body["analyses"] == 2
    assert body["average_score"] == pytest.approx((78.33 + 0.0) / 2, abs=0.01)
    assert body["by_classification"] == {"strategic": 1, "watch": 1}
    assert body["last_analysis_at"] is not None
