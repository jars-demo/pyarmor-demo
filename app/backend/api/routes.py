"""HTTP routes. They validate input and call the services; no business rules live here."""

import platform

from fastapi import APIRouter, Request

from app.backend.api.schemas import AnalyzeRequest, AnalyzeResponse, InfoResponse, ReportResponse
from app.backend.core import build_info
from app.backend.core.config import APP_NAME, APP_VERSION
from app.backend.services.analytics import analyze

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/api/info", response_model=InfoResponse)
def info(request: Request) -> dict:
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "build": build_info.build_flavour(),
        "pyarmor_runtime": build_info.runtime_package(),
        "python": platform.python_version(),
        "environment": request.app.state.settings.environment,
        "endpoints": ["GET /health", "GET /api/info", "POST /api/analyze", "GET /api/report"],
    }


@router.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_customer(body: AnalyzeRequest, request: Request) -> dict:
    result = analyze(body.customer_value, body.risk_factor, body.engagement)
    request.app.state.report.record(result)
    return result


@router.get("/api/report", response_model=ReportResponse)
def report(request: Request) -> dict:
    return request.app.state.report.summary()
