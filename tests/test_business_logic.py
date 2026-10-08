"""The business logic. The fixed expected values double as a contract: the protected build must
produce exactly the same numbers as the original."""

import pytest

from app.business_logic.recommendations import generate_recommendation
from app.business_logic.scoring import calculate_business_score, calculate_risk_score, classify
from app.business_logic.transforms import engagement_curve, proprietary_transform, value_index
from app.services.analytics import analyze


class TestTransforms:
    def test_value_index_bounds(self):
        assert value_index(0) == 0.0
        assert value_index(-50) == 0.0
        assert value_index(1_000_000) == pytest.approx(1.0)
        assert value_index(50_000_000) == 1.0

    def test_value_index_is_log_scaled(self):
        # Ten times the value is far less than ten times the index.
        assert value_index(100_000) < 1.25 * value_index(10_000)

    def test_engagement_curve_endpoints_and_order(self):
        assert engagement_curve(0.0) == pytest.approx(0.0)
        assert engagement_curve(1.0) == pytest.approx(1.0)
        assert engagement_curve(0.3) < engagement_curve(0.55) < engagement_curve(0.8)

    def test_proprietary_transform(self):
        assert proprietary_transform(75_000, 0.78) == {
            "value_index": 0.8125,
            "engagement_index": 0.9027,
        }


class TestScoring:
    def test_risk_is_damped_by_engagement(self):
        assert calculate_risk_score(0.5, 0.0) == 50.0
        assert calculate_risk_score(0.5, 1.0) == 32.5

    def test_risk_bounds(self):
        assert calculate_risk_score(0.0, 0.5) == 0.0
        assert calculate_risk_score(1.0, 0.0) == 100.0

    def test_perfect_customer_scores_100(self):
        assert calculate_business_score(1.0, 1.0, 0.0) == 100.0

    def test_business_score_never_negative(self):
        assert calculate_business_score(0.0, 0.0, 100.0) == 0.0

    @pytest.mark.parametrize(
        ("score", "label"),
        [
            (100, "strategic"),
            (75, "strategic"),
            (74.99, "growth"),
            (55, "growth"),
            (54.99, "nurture"),
            (35, "nurture"),
            (34.99, "watch"),
            (0, "watch"),
        ],
    )
    def test_classify_thresholds(self, score, label):
        assert classify(score) == label


class TestRecommendations:
    def test_growth_with_low_engagement_is_nurtured_instead(self):
        assert generate_recommendation("growth", 10, 0.1)["action"] == "send-onboarding"
        assert generate_recommendation("growth", 10, 0.6)["action"] == "offer-upgrade"

    def test_high_risk_requires_review(self):
        assert generate_recommendation("strategic", 60, 0.9)["requires_review"] is True
        assert generate_recommendation("strategic", 59.99, 0.9)["requires_review"] is False

    def test_unknown_class_falls_back_to_monitor(self):
        assert generate_recommendation("unknown", 0, 0.5)["action"] == "monitor"


# Golden results: change these only when the algorithm changes on purpose.
GOLDEN = [
    ((75_000, 0.32, 0.78), 78.33, 23.26, "strategic", "assign-account-manager"),
    ((900_000, 0.05, 0.95), 98.14, 3.34, "strategic", "assign-account-manager"),
    ((60_000, 0.3, 0.6), 64.52, 23.7, "growth", "offer-upgrade"),
    ((40_000, 0.45, 0.5), 48.68, 37.12, "nurture", "send-onboarding"),
    ((12_000, 0.7, 0.2), 19.44, 65.1, "watch", "monitor"),
    ((0, 0.0, 0.0), 0.0, 0.0, "watch", "monitor"),
]


@pytest.mark.parametrize(("inputs", "score", "risk", "label", "action"), GOLDEN)
def test_analyze_golden_results(inputs, score, risk, label, action):
    result = analyze(*inputs)
    assert result["score"] == score
    assert result["risk_score"] == risk
    assert result["classification"] == label
    assert result["recommendation"]["action"] == action
