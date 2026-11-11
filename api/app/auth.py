from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, Request, Response
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.config import settings
from app.email_service import send_otp_email

SESSION_COOKIE = "amal_session"
CSRF_COOKIE = "amal_csrf"
SESSION_TTL = timedelta(days=30)
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
GOOGLE_PASSWORD_SENTINEL = "google_account_without_password"


def _connect() -> sqlite3.Connection:
    path = Path(settings.database_path).resolve()
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if os.name == "posix":
        path.parent.chmod(0o700)
    connection = sqlite3.connect(path, timeout=10)
    if os.name == "posix":
        path.chmod(0o600)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA busy_timeout = 10000")
    return connection


def initialize_database() -> None:
    with _connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                google_sub TEXT UNIQUE,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
            CREATE TABLE IF NOT EXISTS assessments (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                answers_json TEXT NOT NULL,
                language TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS assessments_user_created_idx
                ON assessments(user_id, created_at DESC);
            CREATE TABLE IF NOT EXISTS otp_verifications (
                email TEXT PRIMARY KEY COLLATE NOCASE,
                code_hash TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                attempts INTEGER DEFAULT 0
            );
            """
        )
        user_columns = {row[1] for row in connection.execute("PRAGMA table_info(users)")}
        if "google_sub" not in user_columns:
            connection.execute("ALTER TABLE users ADD COLUMN google_sub TEXT")
            connection.execute("CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_idx ON users(google_sub)")
        connection.execute("PRAGMA journal_mode = WAL")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${salt.hex()}${digest.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, salt_hex, digest_hex = stored.split("$", maxsplit=2)
        if algorithm != "scrypt":
            return False
        digest = hashlib.scrypt(password.encode("utf-8"), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1)
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def _public_user(row: sqlite3.Row) -> dict[str, Any]:
    keys = set(row.keys())
    password_hash = row["password_hash"] if "password_hash" in keys else None
    google_sub = row["google_sub"] if "google_sub" in keys else None
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "google_linked": bool(google_sub),
        "password_enabled": bool(password_hash and password_hash != GOOGLE_PASSWORD_SENTINEL),
    }


def _create_session(response: Response, user_id: str) -> str:
    raw_token = secrets.token_urlsafe(32)
    csrf_token = secrets.token_urlsafe(32)
    now = _now()
    with _connect() as connection:
        connection.execute(
            "INSERT INTO sessions(token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
            (hashlib.sha256(raw_token.encode()).hexdigest(), user_id, (now + SESSION_TTL).isoformat(), now.isoformat()),
        )
    secure = settings.env == "production"
    response.set_cookie(SESSION_COOKIE, raw_token, httponly=True, secure=secure, samesite="strict", path="/", max_age=int(SESSION_TTL.total_seconds()))
    response.set_cookie(CSRF_COOKIE, csrf_token, httponly=False, secure=secure, samesite="strict", path="/", max_age=int(SESSION_TTL.total_seconds()))
    return csrf_token


def current_user(request: Request) -> dict[str, str]:
    raw_token = request.cookies.get(SESSION_COOKIE)
    if not raw_token:
        raise HTTPException(status_code=401, detail={"code": "AUTH_REQUIRED"})
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    with _connect() as connection:
        row = connection.execute(
            "SELECT u.id, u.name, u.email, u.password_hash, u.google_sub, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?",
            (token_hash,),
        ).fetchone()
        if row is None or datetime.fromisoformat(row["expires_at"]) <= _now():
            connection.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
            raise HTTPException(status_code=401, detail={"code": "AUTH_REQUIRED"})
    return _public_user(row)


def require_csrf(request: Request) -> None:
    cookie = request.cookies.get(CSRF_COOKIE, "")
    header = request.headers.get("X-CSRF-Token", "")
    if not cookie or not header or not hmac.compare_digest(cookie, header):
        raise HTTPException(status_code=403, detail={"code": "CSRF_INVALID"})


def delete_user_sessions(user_id: str, raw_token: str | None) -> None:
    if raw_token:
        with _connect() as connection:
            connection.execute(
                "DELETE FROM sessions WHERE token_hash = ? AND user_id = ?",
                (hashlib.sha256(raw_token.encode()).hexdigest(), user_id),
            )


def delete_other_user_sessions(user_id: str, raw_token: str | None) -> None:
    with _connect() as connection:
        if raw_token:
            current_hash = hashlib.sha256(raw_token.encode()).hexdigest()
            connection.execute("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?", (user_id, current_hash))
        else:
            connection.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))


class RegisterPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    otp_code: str | None = Field(default=None, max_length=10)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not EMAIL_PATTERN.fullmatch(normalized):
            raise ValueError("Invalid email")
        return normalized


class LoginPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not EMAIL_PATTERN.fullmatch(normalized):
            raise ValueError("Invalid email")
        return normalized


class SendOtpPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    email: str = Field(min_length=5, max_length=254)
    name: str = Field(default="", max_length=100)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not EMAIL_PATTERN.fullmatch(normalized):
            raise ValueError("Invalid email")
        return normalized


class VerifyOtpPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    email: str = Field(min_length=5, max_length=254)
    code: str = Field(min_length=4, max_length=10)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not EMAIL_PATTERN.fullmatch(normalized):
            raise ValueError("Invalid email")
        return normalized


class AssessmentRecordPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    text: str = Field(min_length=1, max_length=10000)
    answers: dict[str, str] = Field(default_factory=dict, max_length=10)
    language: str = Field(default="ar", pattern="^(ar|en)$")


def send_registration_otp(email: str, name: str = "", background_tasks: Any | None = None) -> dict[str, Any]:
    normalized_email = email.strip().lower()
    with _connect() as connection:
        existing = connection.execute(
            "SELECT 1 FROM users WHERE email = ? COLLATE NOCASE", (normalized_email,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail={"code": "ACCOUNT_EXISTS"})

        code = f"{secrets.randbelow(900000) + 100000:06d}"
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        now = _now()
        expires_at = (now + timedelta(minutes=10)).isoformat()

        connection.execute(
            """
            INSERT INTO otp_verifications (email, code_hash, expires_at, created_at, attempts)
            VALUES (?, ?, ?, ?, 0)
            ON CONFLICT(email) DO UPDATE SET
                code_hash = excluded.code_hash,
                expires_at = excluded.expires_at,
                created_at = excluded.created_at,
                attempts = 0
            """,
            (normalized_email, code_hash, expires_at, now.isoformat()),
        )

    if background_tasks is not None:
        background_tasks.add_task(send_otp_email, normalized_email, code, name)
    else:
        send_otp_email(normalized_email, code, name)

    return {
        "status": "ok",
        "email": normalized_email,
        "expires_in_seconds": 600,
        "email_sent": True,
        "debug_code": code if settings.env in ("development", "test") else None,
    }


def verify_otp_code(email: str, code: str) -> bool:
    normalized_email = email.strip().lower()
    with _connect() as connection:
        row = connection.execute(
            "SELECT code_hash, expires_at, attempts FROM otp_verifications WHERE email = ? COLLATE NOCASE",
            (normalized_email,),
        ).fetchone()
        if row is None:
            return False

        if datetime.fromisoformat(row["expires_at"]) <= _now():
            connection.execute("DELETE FROM otp_verifications WHERE email = ?", (normalized_email,))
            return False

        if row["attempts"] >= 5:
            connection.execute("DELETE FROM otp_verifications WHERE email = ?", (normalized_email,))
            return False

        code_hash = hashlib.sha256(code.strip().encode()).hexdigest()
        if not hmac.compare_digest(code_hash, row["code_hash"]):
            connection.execute(
                "UPDATE otp_verifications SET attempts = attempts + 1 WHERE email = ?",
                (normalized_email,),
            )
            return False

        return True


def consume_otp_code(email: str, code: str) -> bool:
    if verify_otp_code(email, code):
        with _connect() as connection:
            connection.execute("DELETE FROM otp_verifications WHERE email = ? COLLATE NOCASE", (email.strip().lower(),))
        return True
    return False


def register(payload: RegisterPayload, response: Response) -> dict[str, Any]:
    if payload.otp_code is not None and payload.otp_code != "":
        if not consume_otp_code(payload.email, payload.otp_code):
            raise HTTPException(status_code=400, detail={"code": "INVALID_OTP"})

    user_id = str(uuid4())
    now = _now().isoformat()
    try:
        with _connect() as connection:
            connection.execute(
                "INSERT INTO users(id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
                (user_id, payload.name, payload.email, _password_hash(payload.password), now),
            )
            user = connection.execute("SELECT id, name, email, password_hash, google_sub FROM users WHERE id = ?", (user_id,)).fetchone()
    except sqlite3.IntegrityError as error:
        raise HTTPException(status_code=409, detail={"code": "ACCOUNT_EXISTS"}) from error
    csrf_token = _create_session(response, user_id)
    return {"user": _public_user(user), "csrf_token": csrf_token}


def login(payload: LoginPayload, response: Response) -> dict[str, Any]:
    with _connect() as connection:
        row = connection.execute("SELECT * FROM users WHERE email = ? COLLATE NOCASE", (payload.email,)).fetchone()
    if row is None or not _verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail={"code": "INVALID_CREDENTIALS"})
    csrf_token = _create_session(response, row["id"])
    return {"user": _public_user(row), "csrf_token": csrf_token}


def login_or_create_google_user(subject: str, email: str, name: str, response: Response) -> dict[str, Any]:
    normalized_email = email.strip().lower()
    with _connect() as connection:
        existing = connection.execute("SELECT * FROM users WHERE google_sub = ?", (subject,)).fetchone()
        if existing:
            user_id = existing["id"]
        else:
            existing_email = connection.execute("SELECT * FROM users WHERE email = ? COLLATE NOCASE", (normalized_email,)).fetchone()
            if existing_email:
                if existing_email["google_sub"] and existing_email["google_sub"] != subject:
                    raise ValueError("GOOGLE_ACCOUNT_CONFLICT")
                connection.execute("UPDATE users SET google_sub = ? WHERE id = ?", (subject, existing_email["id"]))
                user_id = existing_email["id"]
            else:
                user_id = str(uuid4())
                connection.execute(
                    "INSERT INTO users(id, name, email, password_hash, google_sub, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_id, name.strip() or normalized_email.split("@")[0], normalized_email, GOOGLE_PASSWORD_SENTINEL, subject, _now().isoformat()),
                )
        user = connection.execute("SELECT id, name, email, password_hash, google_sub FROM users WHERE id = ?", (user_id,)).fetchone()
    csrf_token = _create_session(response, user_id)
    return {"user": _public_user(user), "csrf_token": csrf_token}


def update_user_name(user_id: str, name: str) -> dict[str, Any]:
    with _connect() as connection:
        connection.execute("UPDATE users SET name = ? WHERE id = ?", (name.strip(), user_id))
        row = connection.execute("SELECT id, name, email, password_hash, google_sub FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail={"code": "ACCOUNT_NOT_FOUND"})
    return _public_user(row)


def update_user_password(user_id: str, current_password: str, new_password: str) -> None:
    with _connect() as connection:
        row = connection.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail={"code": "ACCOUNT_NOT_FOUND"})
        if row["password_hash"] == GOOGLE_PASSWORD_SENTINEL:
            raise HTTPException(status_code=409, detail={"code": "PASSWORD_NOT_AVAILABLE"})
        if not _verify_password(current_password, row["password_hash"]):
            raise HTTPException(status_code=400, detail={"code": "CURRENT_PASSWORD_INVALID"})
        connection.execute("UPDATE users SET password_hash = ? WHERE id = ?", (_password_hash(new_password), user_id))


def save_assessment(user_id: str, payload: AssessmentRecordPayload, status: str) -> dict[str, Any]:
    record = {
        "id": str(uuid4()),
        "user_id": user_id,
        "text": payload.text,
        "answers_json": json.dumps(payload.answers, ensure_ascii=False),
        "language": payload.language,
        "status": status,
        "created_at": _now().isoformat(),
    }
    with _connect() as connection:
        connection.execute(
            "INSERT INTO assessments(id, user_id, text, answers_json, language, status, created_at) VALUES (:id, :user_id, :text, :answers_json, :language, :status, :created_at)",
            record,
        )
    answers = json.loads(record.pop("answers_json"))
    return {**record, "answers": answers}


def list_assessments(user_id: str) -> list[dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute(
            "SELECT id, text, answers_json, language, status, created_at FROM assessments WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
    return [
        {"id": row["id"], "text": row["text"], "answers": json.loads(row["answers_json"]), "language": row["language"], "status": row["status"], "created_at": row["created_at"]}
        for row in rows
    ]


def delete_assessments(user_id: str) -> int:
    with _connect() as connection:
        cursor = connection.execute("DELETE FROM assessments WHERE user_id = ?", (user_id,))
        return cursor.rowcount
