"""Runs the business logic for one customer and keeps a running report in memory."""

import logging
import threading
from collections import Counter
from datetime import datetime, timezone

from app.backend.business_logic.recommendations import generate_recommendation
from app.backend.business_logic.scoring import (
    calculate_business_score,
    calculate_risk_score,
    classify,
)
from app.backend.business_logic.transforms import proprietary_transform

logger = logging.getLogger("app.analytics")


def analyze(customer_value: float, risk_factor: float, engagement: float) -> dict:
    """Score one customer: transform, score, classify, recommend."""
    features = proprietary_transform(customer_value, engagement)
    risk = calculate_risk_score(risk_factor, engagement)
    score = calculate_business_score(features["value_index"], features["engagement_index"], risk)
    classification = classify(score)
    return {
        "score": score,
        "risk_score": risk,
        "classification": classification,
        "recommendation": generate_recommendation(classification, risk, engagement),
        "features": features,
    }


class Report:
    """Totals of every analysis since the process started. In memory only: resets on restart."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._count = 0
        self._score_total = 0.0
        self._classes: Counter[str] = Counter()
        self._last_at: datetime | None = None

    def record(self, result: dict) -> None:
        with self._lock:
            self._count += 1
            self._score_total += result["score"]
            self._classes[result["classification"]] += 1
            self._last_at = datetime.now(timezone.utc)
        # Log the outcome, never the raw inputs: logs are read by more people than the code is.
        logger.info(
            "analysis classification=%s score=%.2f", result["classification"], result["score"]
        )

    def summary(self) -> dict:
        with self._lock:
            return {
                "analyses": self._count,
                "average_score": round(self._score_total / self._count, 2) if self._count else None,
                "by_classification": dict(sorted(self._classes.items())),
                "last_analysis_at": self._last_at.isoformat() if self._last_at else None,
            }
