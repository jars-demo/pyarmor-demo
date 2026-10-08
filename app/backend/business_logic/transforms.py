"""Proprietary feature transforms.

Raw inputs are reshaped before scoring. In a real product, this is the kind of tuning a team spends
months on, and the kind of code it might not want a competitor to read and copy. The numbers here
are invented for the workshop.
"""

import math

# Customer value at which the value index reaches 1.0. Above it, extra value adds nothing.
VALUE_CEILING = 1_000_000

# Engagement curve: an S-curve centred on MIDPOINT. Below it, engagement counts for little;
# above it, it counts for a lot.
ENGAGEMENT_MIDPOINT = 0.55
ENGAGEMENT_STEEPNESS = 9.0


def value_index(customer_value: float) -> float:
    """Map a customer value in currency units to 0..1 on a log scale."""
    if customer_value <= 0:
        return 0.0
    scaled = math.log10(1 + customer_value) / math.log10(1 + VALUE_CEILING)
    return min(1.0, scaled)


def engagement_curve(engagement: float) -> float:
    """Map engagement (0..1) through an S-curve, normalised so 0 → 0 and 1 → 1."""

    def sigmoid(x: float) -> float:
        return 1 / (1 + math.exp(-ENGAGEMENT_STEEPNESS * (x - ENGAGEMENT_MIDPOINT)))

    low, high = sigmoid(0.0), sigmoid(1.0)
    return (sigmoid(engagement) - low) / (high - low)


def proprietary_transform(customer_value: float, engagement: float) -> dict[str, float]:
    """Turn raw inputs into the features the scoring model uses."""
    return {
        "value_index": round(value_index(customer_value), 4),
        "engagement_index": round(engagement_curve(engagement), 4),
    }
