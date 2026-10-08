"""The scoring model: the demo's main piece of "intellectual property".

Every weight and threshold below is a business decision. Readable source gives all of them away
in seconds, which is what the workshop protects with PyArmor and then examines honestly.
"""

# How much engaged customers reduce raw risk (0.35 = up to 35% less).
ENGAGEMENT_RISK_DAMPING = 0.35

# Weights of the business score. They are tuned so a perfect customer with no risk scores 100.
WEIGHTS = {"value": 0.55, "engagement": 0.45, "risk_penalty": 0.30}

# Lower bounds of each class, checked from the top down.
CLASS_THRESHOLDS = (
    (75.0, "strategic"),
    (55.0, "growth"),
    (35.0, "nurture"),
    (0.0, "watch"),
)


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def calculate_risk_score(risk_factor: float, engagement: float) -> float:
    """Risk on 0..100. Engagement damps risk: an active customer is a safer customer."""
    raw = risk_factor * 100
    damped = raw * (1 - ENGAGEMENT_RISK_DAMPING * engagement)
    return round(_clamp(damped), 2)


def calculate_business_score(
    value_index: float, engagement_index: float, risk_score: float
) -> float:
    """Business score on 0..100 from the transformed features and the risk score."""
    positive = WEIGHTS["value"] * value_index + WEIGHTS["engagement"] * engagement_index
    penalty = WEIGHTS["risk_penalty"] * risk_score
    return round(_clamp(positive * 100 - penalty), 2)


def classify(score: float) -> str:
    """Name the band a business score falls in."""
    for threshold, label in CLASS_THRESHOLDS:
        if score >= threshold:
            return label
    return "watch"
