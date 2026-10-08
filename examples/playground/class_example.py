"""A class: methods, state and a classmethod, all protected together."""


class ChurnPredictor:
    """Flags customers likely to leave, from simple usage signals."""

    THRESHOLD = 0.6

    def __init__(self, weight_logins: float = 0.5, weight_tickets: float = 0.3) -> None:
        self.weight_logins = weight_logins
        self.weight_tickets = weight_tickets

    def risk(self, logins_last_30d: int, open_tickets: int) -> float:
        inactivity = max(0.0, 1 - logins_last_30d / 20)
        frustration = min(1.0, open_tickets / 5)
        return round(self.weight_logins * inactivity + self.weight_tickets * frustration, 3)

    def will_churn(self, logins_last_30d: int, open_tickets: int) -> bool:
        return self.risk(logins_last_30d, open_tickets) >= self.THRESHOLD

    @classmethod
    def strict(cls) -> "ChurnPredictor":
        return cls(weight_logins=0.7, weight_tickets=0.4)
