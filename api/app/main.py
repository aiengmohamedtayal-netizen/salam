from __future__ import annotations

import json
import logging
import re
import secrets
import time
from contextlib import asynccontextmanager
from typing import Literal
from urllib.parse import urlencode
from uuid import uuid4

import httpx
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address


from app.config import settings

from app.auth import (  # noqa: E402
    AssessmentRecordPayload,
    LoginPayload,
    RegisterPayload,
    SendOtpPayload,
    VerifyOtpPayload,
    current_user,
    delete_assessments,
    delete_other_user_sessions,
    delete_user_sessions,
    initialize_database,
    list_assessments,
    login,
    login_or_create_google_user,
    optional_csrf,
    optional_user,
    register,
    require_csrf,
    save_assessment,
    send_registration_otp,
    update_user_name,
    update_user_password,
    verify_otp_code,
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


class TipsGenerateRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    count: int = Field(default=2, ge=1, le=5)


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
app.add_middleware(GZipMiddleware, minimum_size=500)


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


@app.post("/api/v1/auth/send-otp")
@limiter.limit("10/minute")
async def auth_send_otp(request: Request, payload: SendOtpPayload, background_tasks: BackgroundTasks):
    return send_registration_otp(payload.email, payload.name, background_tasks)


@app.post("/api/v1/auth/verify-otp")
@limiter.limit("20/minute")
async def auth_verify_otp(request: Request, payload: VerifyOtpPayload):
    valid = verify_otp_code(payload.email, payload.code)
    if not valid:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_OTP", "message": "رمز التحقق غير صحيح أو انتهت صلاحيته"},
        )
    return {"status": "ok", "valid": True}


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


_GOOGLE_OAUTH_SESSIONS: dict[str, dict] = {}


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

    # Determine originating frontend host (handles localhost vs 127.0.0.1 dynamically)
    referer = request.headers.get("referer") or ""
    host_header = request.headers.get("host") or ""
    if "localhost" in referer or "localhost" in host_header:
        origin_frontend = "http://localhost:5173"
        origin_redirect = "http://localhost:5173/api/v1/auth/google/callback"
    else:
        origin_frontend = settings.frontend_url.rstrip("/")
        origin_redirect = settings.google_redirect_uri

    state = secrets.token_urlsafe(32)
    nonce = secrets.token_urlsafe(32)

    # Save session server-side as resilient fallback if cookies are partitioned/lost across localhost vs 127.0.0.1
    _GOOGLE_OAUTH_SESSIONS[state] = {
        "nonce": nonce,
        "next": next_path,
        "form": auth_path,
        "frontend": origin_frontend,
        "redirect": origin_redirect,
        "time": time.time(),
    }

    query = urlencode({
        "client_id": settings.google_client_id,
        "redirect_uri": origin_redirect,
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
        "path": "/",
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
    # Cleanup expired sessions (> 15 mins)
    now_ts = time.time()
    for k, v in list(_GOOGLE_OAUTH_SESSIONS.items()):
        if now_ts - v.get("time", 0) > 900:
            _GOOGLE_OAUTH_SESSIONS.pop(k, None)

    session_info = _GOOGLE_OAUTH_SESSIONS.pop(state, {})

    next_path = _safe_return_path(request.cookies.get("amal_google_next") or session_info.get("next"))
    auth_path = _safe_auth_path(request.cookies.get("amal_google_form") or session_info.get("form"), next_path)
    frontend_base = session_info.get("frontend") or settings.frontend_url.rstrip("/")
    redirect_uri_used = session_info.get("redirect") or settings.google_redirect_uri

    state_cookie = request.cookies.get("amal_google_state", "")
    nonce_cookie = request.cookies.get("amal_google_nonce", "") or session_info.get("nonce", "")

    def failed(code_name: str):
        response = RedirectResponse(frontend_base.rstrip("/") + auth_path + "?auth_error=" + code_name, status_code=303)
        for key in ("amal_google_state", "amal_google_nonce", "amal_google_next", "amal_google_form"):
            response.delete_cookie(key, path="/", secure=settings.env == "production", samesite="lax")
            response.delete_cookie(key, path="/api/v1/auth/google", secure=settings.env == "production", samesite="lax")
        return response

    if error:
        return failed("GOOGLE_CANCELLED")

    # Validate state: either valid state_cookie or valid server-side session
    is_valid_state = bool(
        (state_cookie and secrets.compare_digest(state, state_cookie))
        or session_info
    )
    if not code or not state or not is_valid_state:
        return failed("GOOGLE_STATE_INVALID")

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": redirect_uri_used,
                    "grant_type": "authorization_code",
                },
            )
            token_response.raise_for_status()
            token_data = token_response.json()
        try:
            from google.auth.transport.requests import Request as GoogleRequest
            from google.oauth2 import id_token

            identity = await run_in_threadpool(
                id_token.verify_oauth2_token,
                token_data["id_token"],
                GoogleRequest(),
                settings.google_client_id,
            )
        except Exception as verify_err:
            logger.warning("verify_oauth2_token failed (%s), inspecting direct token payload", verify_err)
            import jwt
            identity = jwt.decode(token_data.get("id_token", ""), options={"verify_signature": False})
            aud = identity.get("aud")
            iss = identity.get("iss")
            if aud != settings.google_client_id or iss not in ("accounts.google.com", "https://accounts.google.com"):
                logger.error("Token aud/iss mismatch: aud=%s, iss=%s", aud, iss)
                return failed("GOOGLE_IDENTITY_INVALID")

        if (nonce_cookie and identity.get("nonce") != nonce_cookie) or identity.get("email_verified") is not True:
            return failed("GOOGLE_IDENTITY_INVALID")
        subject = identity.get("sub", "")
        email = identity.get("email", "")
        name = identity.get("name", "")
        if not subject or not email:
            return failed("GOOGLE_IDENTITY_INVALID")

        response = RedirectResponse(frontend_base.rstrip("/") + next_path, status_code=303)
        login_or_create_google_user(subject, email, name, response)
        for key in ("amal_google_state", "amal_google_nonce", "amal_google_next", "amal_google_form"):
            response.delete_cookie(key, path="/", secure=settings.env == "production", samesite="lax")
            response.delete_cookie(key, path="/api/v1/auth/google", secure=settings.env == "production", samesite="lax")
        return response
    except ValueError as exception:
        if str(exception) == "GOOGLE_ACCOUNT_CONFLICT":
            return failed("GOOGLE_ACCOUNT_CONFLICT")
        logger.exception("google_auth_failed ValueError: %s", exception)
        return failed("GOOGLE_AUTH_FAILED")
    except (httpx.HTTPError, KeyError, TypeError) as exception:
        logger.exception("google_auth_failed HTTP/Key/Type: %s", exception)
        return failed("GOOGLE_AUTH_FAILED")
    except Exception as exception:
        logger.exception("google_auth_failed Exception: %s", exception)
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
async def assistant_message(request: Request, payload: AssistantRequest, user: dict | None = Depends(optional_user), _: None = Depends(optional_csrf)):
    if not settings.sovereign_api_key:
        return error_response(503, "ASSISTANT_UNAVAILABLE", "No privacy-reviewed assistant provider is configured.", request.state.request_id)

    system_prompt = (
        "أنت مساعد أمل (AMAL Assistant)، مساعد ذكي وداعم يقدم إجابات دقيقة ومفيدة ولطيفة باللغة التي يخاطبك بها المستخدم (العربية أو الإنجليزية). "
        "في سياق المنصة، تقدم الدعم والتوعية وتوضح أنك أداة توعية ولست بديلاً عن الطبيب النفسي أو الاستشارة الطبية المتخصصة. "
        "في المواضيع العامة الأخرى (مثل الأنشطة، الأسئلة العامة، الاستفسارات اليومية)، أجب بشكل مباشر وودود وممتع ومفيد."
        if payload.language == "ar"
        else (
            "You are AMAL Assistant, an intelligent, empathetic, and supportive AI companion. "
            "Answer clearly, helpfully, and warmly in the user's language. "
            "For platform and mental health topics, provide educational awareness and clarify that you are not a clinical tool. "
            "For general inquiries, be helpful, natural, and engaging."
        )
    )

    messages = [{"role": "system", "content": system_prompt}]
    for turn in payload.history:
        messages.append({"role": turn.role, "content": turn.text})
    messages.append({"role": "user", "content": payload.message})

    try:
        headers = {
            "Authorization": f"Bearer {settings.sovereign_api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "model": settings.sovereign_model,
            "messages": messages,
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                f"{settings.sovereign_base_url.rstrip('/')}/chat/completions",
                headers=headers,
                json=body,
            )

        if response.status_code != 200:
            logger.error("SovereignEG API error: %s %s", response.status_code, response.text)
            return error_response(502, "UPSTREAM_ERROR", "The assistant service encountered an error.", request.state.request_id)

        data = response.json()
        choices = data.get("choices", [])
        if not choices:
            return error_response(502, "UPSTREAM_EMPTY", "Empty response from assistant provider.", request.state.request_id)

        msg = choices[0].get("message", {})
        answer = (msg.get("content") or msg.get("reasoning_content") or "").strip()
        return {"text": answer, "request_id": request.state.request_id}

    except Exception as exc:
        logger.exception("Assistant request failed: %s", exc)
        return error_response(500, "ASSISTANT_FAILED", "Failed to communicate with assistant provider.", request.state.request_id)


@app.post("/api/v1/tips/generate")
@limiter.limit(settings.rate_limit)
async def generate_mindful_tips_endpoint(
    request: Request,
    payload: TipsGenerateRequest = TipsGenerateRequest(),
    user: dict | None = Depends(optional_user),
    _: None = Depends(optional_csrf),
):
    if not settings.sovereign_api_key:
        return error_response(503, "ASSISTANT_UNAVAILABLE", "No reviewed AI provider is configured.", request.state.request_id)

    system_prompt = (
        "You are AMAL Mental Health AI expert. "
        "Respond ONLY with a valid JSON array of mindful tip objects matching the requested schema. "
        "No markdown code blocks outside the JSON, no conversational preamble, no trailing text."
    )
    user_prompt = f"""قم بتوليد {payload.count} نصائح نفسية جديدة وملهمة ومختلفة عن المألوف لمنصة أمل للوعي النفسي والصحة النفسية.
يجب أن ترجع النتيجة كمصفوفة JSON فقط تحوي {payload.count} كائنات بالهيكل التالي:
[
  {{
    "category": "فئة النصيحة بالعربية",
    "categoryEn": "Category in English",
    "title": "عنوان جذاب بالعربية",
    "titleEn": "Title in English",
    "quote": "اقتباس ملهم قصير بالعربية",
    "quoteEn": "Short inspiring quote in English",
    "body": "شرح نفسي مبسط بالعربية في سطرين",
    "bodyEn": "Concise psychological insight in English",
    "exercise": "تمرين دقيقة واحدة بالعربية",
    "exerciseEn": "One minute exercise in English",
    "iconName": "wind",
    "theme": "teal"
  }}
]
اختر iconName من: ["wind", "heart", "sparkles", "shield", "sprout", "sun", "edit", "care"]
اختر theme من: ["teal", "purple", "rose", "amber", "emerald"]
"""

    try:
        headers = {
            "Authorization": f"Bearer {settings.sovereign_api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "model": settings.sovereign_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.75,
        }
        async with httpx.AsyncClient(timeout=75.0) as client:
            response = await client.post(
                f"{settings.sovereign_base_url.rstrip('/')}/chat/completions",
                headers=headers,
                json=body,
            )

        if response.status_code != 200:
            logger.error("SovereignEG API error: %s %s", response.status_code, response.text)
            return error_response(502, "UPSTREAM_ERROR", "The AI service encountered an error.", request.state.request_id)

        data = response.json()
        choices = data.get("choices", [])
        if not choices:
            return error_response(502, "UPSTREAM_EMPTY", "Empty response from AI provider.", request.state.request_id)

        msg = choices[0].get("message", {})
        raw_text = (msg.get("content") or msg.get("reasoning_content") or "").strip()

        parsed_tips = None
        try:
            parsed_tips = json.loads(raw_text)
        except Exception:
            match = re.search(r"\[\s*\{[\s\S]*\}\s*\]", raw_text)
            if match:
                try:
                    parsed_tips = json.loads(match.group(0))
                except Exception:
                    pass

        if not isinstance(parsed_tips, list):
            logger.warning("Could not parse tips JSON: %s", raw_text[:200])
            return error_response(502, "PARSE_ERROR", "Failed to parse generated tips.", request.state.request_id)

        sanitized = []
        allowed_icons = {"wind", "heart", "sparkles", "shield", "sprout", "sun", "edit", "care"}
        allowed_themes = {"teal", "purple", "rose", "amber", "emerald"}
        now_ts = int(time.time() * 1000)

        for idx, item in enumerate(parsed_tips):
            if not isinstance(item, dict):
                continue
            icon = item.get("iconName")
            theme = item.get("theme")
            sanitized.append({
                "id": f"ai-tip-{now_ts}-{idx}-{secrets.token_hex(3)}",
                "category": item.get("category", "وعي نفسي"),
                "categoryEn": item.get("categoryEn", "Mindful Insight"),
                "title": item.get("title", "لحظة وعي"),
                "titleEn": item.get("titleEn", "Mindful Moment"),
                "quote": item.get("quote", "تنفس بعمق وامنح نفسك مساحة للأمان."),
                "quoteEn": item.get("quoteEn", "Breathe deeply and find peace."),
                "body": item.get("body", "كل لحظة هي فرصة جديدة للبدء بلطف وهدوء."),
                "bodyEn": item.get("bodyEn", "Every moment is a gentle chance to begin anew."),
                "exercise": item.get("exercise", "خذ 3 أنفاس عميقة وركز على إحساس جسدك."),
                "exerciseEn": item.get("exerciseEn", "Take three deep breaths."),
                "iconName": icon if icon in allowed_icons else "sparkles",
                "theme": theme if theme in allowed_themes else "purple",
                "isAiGenerated": True,
            })

        return {"tips": sanitized, "request_id": request.state.request_id}

    except Exception as exc:
        logger.exception("Tips generation request failed: %s", exc)
        return error_response(500, "GENERATION_FAILED", "Failed to communicate with AI provider.", request.state.request_id)

