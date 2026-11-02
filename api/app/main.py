from __future__ import annotations

import logging
import secrets
import time
from contextlib import asynccontextmanager
from typing import Literal
from urllib.parse import urlencode
from uuid import uuid4

import httpx
from fastapi import FastAPI, Request
from fastapi import Depends, HTTPException, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address


from app.config import settings

from app.auth import (  # noqa: E402
    AssessmentRecordPayload,
    LoginPayload,
    RegisterPayload,
    current_user,
    delete_assessments,
    delete_other_user_sessions,
    delete_user_sessions,
    initialize_database,
    list_assessments,
    login,
    login_or_create_google_user,
    register,
    require_csrf,
    save_assessment,
    update_user_name,
    update_user_password,
)
from starlette.concurrency import run_in_threadpool

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("amal.api")
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")


class AnalysisRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    text: str = Field(min_length=1, max_length=10000)
    language: str = Field(default="ar", pattern="^(ar|en)$")
    answers: dict[str, str] = Field(default_factory=dict, max_length=10)

    @field_validator("text")
    @classmethod
    def require_non_whitespace(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Input is required")
        return value.strip()


class AssistantRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    message: str = Field(min_length=1, max_length=4000)
    language: str = Field(default="ar", pattern="^(ar|en)$")
    history: list["ChatTurn"] = Field(default_factory=list, max_length=6)


class ChatTurn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    role: Literal["user", "assistant"]
    text: str = Field(min_length=1, max_length=4000)


class MultimodalRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    text: str = Field(default="", max_length=2500)
    modality: str = Field(pattern="^(textOnly|imageOnly|multimodal|triModal|textVoice|imageVoice|voiceOnly)$")
    language: str = Field(default="ar", pattern="^(ar|en)$")


class AnalysisResponse(BaseModel):
    schema_version: str = "1.0"
    request_id: str
    status: Literal["ok", "abstained", "out_of_scope", "insufficient_input"]
    disclaimer_key: str = "analysis.non_diagnostic"


class ProfilePayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(min_length=1, max_length=100)


class PasswordChangePayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


def _safe_return_path(path: str | None) -> str:
    if not path or "\\" in path or path.startswith("//"):
        return "/ar/assessment"
    if path.startswith(("/ar/", "/en/")) or path in ("/ar", "/en"):
        return path
    return "/ar/assessment"


def _safe_auth_path(path: str | None, next_path: str) -> str:
    if path in ("/ar/login", "/ar/register", "/en/login", "/en/register"):
        return path
    return "/en/login" if next_path.startswith("/en") else "/ar/login"


def error_response(status_code: int, code: str, message: str, request_id: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "request_id": request_id}},
    )


@asynccontextmanager
async def lifespan(_: FastAPI):
    # No trained model artifact is included in the repository. Readiness remains
    # false until a reviewed inference adapter and its verified manifest exist.
    initialize_database()
    yield


app = FastAPI(title="AMAL API", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Request-ID", "X-CSRF-Token"],
)


@app.middleware("http")
async def content_free_request_logging(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid4())
    request.state.request_id = request_id
    started = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.error("request_failed request_id=%s route=%s", request_id, request.url.path)
        response = error_response(500, "INTERNAL_ERROR", "Request could not be completed.", request_id)
    response.headers["X-Request-ID"] = request_id
    response.headers["Cache-Control"] = "no-store"
    logger.info(
        "request_complete request_id=%s route=%s status=%s duration_ms=%d",
        request_id,
        request.url.path,
        response.status_code,
        round((time.perf_counter() - started) * 1000),
    )
    return response


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, _: RequestValidationError):
    return error_response(422, "INVALID_REQUEST", "Request validation failed.", request.state.request_id)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_error_handler(request: Request, _: RateLimitExceeded):
    return error_response(429, "RATE_LIMITED", "Request limit exceeded. Please retry later.", request.state.request_id)


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, _: Exception):
    return error_response(500, "INTERNAL_ERROR", "Request could not be completed.", request.state.request_id)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/ready")
async def ready():
    return JSONResponse(status_code=503, content={"status": "not_ready", "reason": "MODEL_ARTIFACT_UNAVAILABLE"})


@app.post("/api/v1/auth/register")
@limiter.limit("5/minute")
async def auth_register(request: Request, payload: RegisterPayload, response: Response):
    return register(payload, response)


@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")
async def auth_login(request: Request, payload: LoginPayload, response: Response):
    return login(payload, response)


@app.get("/api/v1/auth/providers")
async def auth_providers():
    return {"google": settings.google_auth_enabled}


@app.get("/api/v1/auth/google/start")
@limiter.limit("5/minute")
async def auth_google_start(request: Request, next: str = "/ar/assessment", form: str = ""):
    next_path = _safe_return_path(next)
    auth_path = _safe_auth_path(form, next_path)
    if not settings.google_auth_enabled:
        return RedirectResponse(
            settings.frontend_url.rstrip("/") + auth_path + "?auth_error=GOOGLE_NOT_CONFIGURED",
            status_code=303,
        )
    state = secrets.token_urlsafe(32)
    nonce = secrets.token_urlsafe(32)
    query = urlencode({
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "nonce": nonce,
        "prompt": "select_account",
    })
    response = RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}", status_code=302)
    cookie_options = {
        "httponly": True,
        "secure": settings.env == "production",
        "samesite": "lax",
        "path": "/api/v1/auth/google",
        "max_age": 600,
    }
    response.set_cookie("amal_google_state", state, **cookie_options)
    response.set_cookie("amal_google_nonce", nonce, **cookie_options)
    response.set_cookie("amal_google_next", next_path, **cookie_options)
    response.set_cookie("amal_google_form", auth_path, **cookie_options)
    return response


@app.get("/api/v1/auth/google/callback")
@limiter.limit("10/minute")
async def auth_google_callback(request: Request, code: str = "", state: str = "", error: str = ""):
    next_path = _safe_return_path(request.cookies.get("amal_google_next"))
    auth_path = _safe_auth_path(request.cookies.get("amal_google_form"), next_path)
    state_cookie = request.cookies.get("amal_google_state", "")
    nonce_cookie = request.cookies.get("amal_google_nonce", "")

    def failed(code_name: str):
        response = RedirectResponse(settings.frontend_url.rstrip("/") + auth_path + "?auth_error=" + code_name, status_code=303)
        for key in ("amal_google_state", "amal_google_nonce", "amal_google_next", "amal_google_form"):
            response.delete_cookie(key, path="/api/v1/auth/google", secure=settings.env == "production", samesite="lax")
        return response

    if error:
        return failed("GOOGLE_CANCELLED")
    if not code or not state_cookie or not secrets.compare_digest(state, state_cookie):
        return failed("GOOGLE_STATE_INVALID")

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": settings.google_redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            token_response.raise_for_status()
            token_data = token_response.json()
        from google.auth.transport.requests import Request as GoogleRequest
        from google.oauth2 import id_token

        identity = await run_in_threadpool(
            id_token.verify_oauth2_token,
            token_data["id_token"],
            GoogleRequest(),
            settings.google_client_id,
        )
        if identity.get("nonce") != nonce_cookie or identity.get("email_verified") is not True:
            return failed("GOOGLE_IDENTITY_INVALID")
        subject = identity.get("sub", "")
        email = identity.get("email", "")
        name = identity.get("name", "")
        if not subject or not email:
            return failed("GOOGLE_IDENTITY_INVALID")

        response = RedirectResponse(settings.frontend_url.rstrip("/") + next_path, status_code=303)
        login_or_create_google_user(subject, email, name, response)
        for key in ("amal_google_state", "amal_google_nonce", "amal_google_next", "amal_google_form"):
            response.delete_cookie(key, path="/api/v1/auth/google", secure=settings.env == "production", samesite="lax")
        return response
    except ValueError as exception:
        if str(exception) == "GOOGLE_ACCOUNT_CONFLICT":
            return failed("GOOGLE_ACCOUNT_CONFLICT")
        return failed("GOOGLE_AUTH_FAILED")
    except (httpx.HTTPError, KeyError, TypeError):
        return failed("GOOGLE_AUTH_FAILED")
    except Exception:
        logger.warning("google_auth_failed request_id=%s", request.state.request_id)
        return failed("GOOGLE_AUTH_FAILED")


@app.get("/api/v1/auth/me")
async def auth_me(request: Request, response: Response, user: dict = Depends(current_user)):
    csrf_token = request.cookies.get("amal_csrf") if request else None
    if not csrf_token:
        csrf_token = secrets.token_urlsafe(32)
        response.set_cookie("amal_csrf", csrf_token, httponly=False, secure=settings.env == "production", samesite="strict", path="/", max_age=30 * 24 * 60 * 60)
    return {"user": user, "csrf_token": csrf_token}


@app.patch("/api/v1/auth/profile")
async def auth_update_profile(payload: ProfilePayload, user: dict = Depends(current_user), _: None = Depends(require_csrf)):
    return {"user": update_user_name(user["id"], payload.name)}


@app.post("/api/v1/auth/password")
async def auth_change_password(request: Request, payload: PasswordChangePayload, user: dict = Depends(current_user), _: None = Depends(require_csrf)):
    update_user_password(user["id"], payload.current_password, payload.new_password)
    delete_other_user_sessions(user["id"], request.cookies.get("amal_session"))
    return {"status": "updated"}


@app.post("/api/v1/auth/logout")
async def auth_logout(request: Request, response: Response, user: dict = Depends(current_user), _: None = Depends(require_csrf)):
    delete_user_sessions(user["id"], request.cookies.get("amal_session"))
    response.delete_cookie("amal_session", path="/", httponly=True, secure=settings.env == "production", samesite="strict")
    response.delete_cookie("amal_csrf", path="/", secure=settings.env == "production", samesite="strict")
    return {"status": "ok"}


@app.get("/api/v1/assessments")
async def assessment_history(user: dict = Depends(current_user)):
    return {"assessments": list_assessments(user["id"])}


@app.delete("/api/v1/assessments")
async def clear_assessment_history(user: dict = Depends(current_user), _: None = Depends(require_csrf)):
    return {"deleted": delete_assessments(user["id"])}


@app.post("/api/v1/analysis/text", response_model=AnalysisResponse)
@limiter.limit(settings.rate_limit)
async def analyze_text(request: Request, payload: AnalysisRequest, user: dict = Depends(current_user), _: None = Depends(require_csrf)):
    request_id = request.state.request_id
    if len(payload.text) > settings.max_text_length:
        return error_response(422, "TEXT_TOO_LONG", "Text exceeds the configured character limit.", request_id)
    if len(payload.text) < 15 or len(payload.text.split()) < 3:
        save_assessment(user["id"], AssessmentRecordPayload(text=payload.text, answers=payload.answers, language=payload.language), "insufficient_input")
        return JSONResponse(
            status_code=200,
            content=AnalysisResponse(request_id=request_id, status="insufficient_input").model_dump(),
        )
    save_assessment(user["id"], AssessmentRecordPayload(text=payload.text, answers=payload.answers, language=payload.language), "model_unavailable")
    # Never infer an assessment from fabricated rules or an unverified model.
    return error_response(
        503,
        "MODEL_UNAVAILABLE",
        "Text analysis is temporarily unavailable because no reviewed model artifact is configured.",
        request_id,
    )


@app.post("/api/v1/analysis/claims")
@limiter.limit(settings.rate_limit)
async def verify_claim(request: Request, payload: AnalysisRequest, user: dict = Depends(current_user), _: None = Depends(require_csrf)):
    return error_response(503, "VERIFICATION_UNAVAILABLE", "No evidence verification provider is configured.", request.state.request_id)


@app.post("/api/v1/analysis/multimodal")
@limiter.limit(settings.rate_limit)
async def analyze_multimodal(request: Request, payload: MultimodalRequest, user: dict = Depends(current_user), _: None = Depends(require_csrf)):
    return error_response(503, "MODEL_UNAVAILABLE", "No reviewed multimodal inference model is configured.", request.state.request_id)


@app.post("/api/v1/assistant/messages")
@limiter.limit(settings.rate_limit)
async def assistant_message(request: Request, payload: AssistantRequest, user: dict = Depends(current_user), _: None = Depends(require_csrf)):
    return error_response(503, "ASSISTANT_UNAVAILABLE", "No privacy-reviewed assistant provider is configured.", request.state.request_id)
