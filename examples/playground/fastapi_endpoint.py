"""A FastAPI endpoint. Routes are protected like any other module; the HTTP API stays the same."""

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Order(BaseModel):
    amount: float = Field(gt=0)
    country: str = Field(min_length=2, max_length=2)


FRAUD_COUNTRIES = {"XX", "YY"}


@app.post("/score-order")
def score_order(order: Order) -> dict:
    """Return a fraud score for an order. The rules are the protected part."""
    score = 0.1
    if order.amount > 5000:
        score += 0.4
    if order.country.upper() in FRAUD_COUNTRIES:
        score += 0.3
    return {"fraud_score": round(min(score, 1.0), 2), "review": score >= 0.5}
