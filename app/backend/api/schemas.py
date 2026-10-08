"""Request and response models. FastAPI validates input against them: bad data gets a 422."""

from pydantic import BaseModel, ConfigDict, Field


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "examples": [{"customer_value": 75000, "risk_factor": 0.32, "engagement": 0.78}]
        },
    )

    customer_value: float = Field(ge=0, le=100_000_000, description="Yearly value, currency units")
    risk_factor: float = Field(ge=0, le=1, description="0 = no risk, 1 = maximum risk")
    engagement: float = Field(ge=0, le=1, description="0 = inactive, 1 = highly engaged")


class Recommendation(BaseModel):
    action: str
    message: str
    requires_review: bool


class Features(BaseModel):
    value_index: float
    engagement_index: float


class AnalyzeResponse(BaseModel):
    score: float
    risk_score: float
    classification: str
    recommendation: Recommendation
    features: Features


class ReportResponse(BaseModel):
    analyses: int
    average_score: float | None
    by_classification: dict[str, int]
    last_analysis_at: str | None


class InfoResponse(BaseModel):
    name: str
    version: str
    build: str
    pyarmor_runtime: str | None
    python: str
    environment: str
    endpoints: list[str]
