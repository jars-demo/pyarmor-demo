"""Pricing rules: the kind of logic a company would rather not publish."""

BASE_MARGIN = 0.32
VOLUME_BREAKS = ((1000, 0.05), (500, 0.03), (100, 0.01))


def quote(unit_cost: float, quantity: int, priority: bool = False) -> float:
    """Price an order: cost plus margin, minus volume discounts, plus a rush fee."""
    price = unit_cost * (1 + BASE_MARGIN) * quantity
    for threshold, discount in VOLUME_BREAKS:
        if quantity >= threshold:
            price *= 1 - discount
            break
    if priority:
        price *= 1.15
    return round(price, 2)
