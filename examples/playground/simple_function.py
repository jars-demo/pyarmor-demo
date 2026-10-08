"""A single function: the smallest thing PyArmor can protect."""


def apply_discount(price: float, loyalty_years: int) -> float:
    """Loyal customers get 2% off per year, capped at 10%."""
    discount = min(loyalty_years * 0.02, 0.10)
    return round(price * (1 - discount), 2)
