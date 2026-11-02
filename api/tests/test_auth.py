import sqlite3

from app.config import settings
from conftest import register_user


def test_registration_creates_hashed_account_and_session(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Amal User", "email": "Amal@Example.com", "password": "strong-password-1"},
    )

    assert response.status_code == 200
    assert response.json()["user"]["email"] == "amal@example.com"
    assert "amal_session" in response.cookies
    assert response.cookies.get("amal_session") != response.json().get("password")
    assert client.get("/api/v1/auth/me").json()["user"]["name"] == "Amal User"
    with sqlite3.connect(settings.database_path) as connection:
        stored_password = connection.execute("SELECT password_hash FROM users").fetchone()[0]
    assert stored_password.startswith("scrypt$")
    assert stored_password != "strong-password-1"


def test_duplicate_registration_is_rejected(client):
    register_user(client)
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Another User", "email": "TEST@example.com", "password": "another-password"},
    )
    assert response.status_code == 409
    assert response.json()["detail"]["code"] == "ACCOUNT_EXISTS"


def test_login_rejects_invalid_credentials_and_accepts_valid_credentials(client):
    register_user(client)
    invalid = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "wrong-password"})
    assert invalid.status_code == 401
    assert invalid.json()["detail"]["code"] == "INVALID_CREDENTIALS"

    valid = client.post("/api/v1/auth/login", json={"email": "TEST@example.com", "password": "correct horse battery staple"})
    assert valid.status_code == 200
    assert valid.json()["user"]["email"] == "test@example.com"
    assert "amal_session" in valid.cookies


def test_assessment_route_requires_authenticated_user_and_csrf(client):
    payload = {"text": "I have felt overwhelmed and isolated this week", "language": "en"}
    assert client.post("/api/v1/analysis/text", json=payload).status_code == 401

    register_user(client)
    response = client.post("/api/v1/analysis/text", json=payload)
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "CSRF_INVALID"


def test_assessment_history_is_persisted_per_account_and_can_be_deleted(client):
    csrf = register_user(client, "first@example.com")
    payload = {"text": "I have felt overwhelmed and isolated this week", "language": "en", "answers": {"sleep": "poor"}}
    analysis = client.post("/api/v1/analysis/text", json=payload, headers={"X-CSRF-Token": csrf})
    assert analysis.status_code == 503
    assert analysis.json()["error"]["code"] == "MODEL_UNAVAILABLE"

    history = client.get("/api/v1/assessments")
    assert history.status_code == 200
    assert len(history.json()["assessments"]) == 1
    assert history.json()["assessments"][0]["text"] == payload["text"]
    assert history.json()["assessments"][0]["answers"] == payload["answers"]
    assert history.json()["assessments"][0]["status"] == "model_unavailable"

    second_client_csrf = register_user(client, "second@example.com")
    assert second_client_csrf
    assert client.get("/api/v1/assessments").json()["assessments"] == []

    # Return to the first account and clear only that account's history.
    first_csrf = client.post(
        "/api/v1/auth/login",
        json={"email": "first@example.com", "password": "correct horse battery staple"},
    ).json()["csrf_token"]
    deleted = client.delete("/api/v1/assessments", headers={"X-CSRF-Token": first_csrf})
    assert deleted.status_code == 200
    assert deleted.json()["deleted"] == 1
    assert client.get("/api/v1/assessments").json()["assessments"] == []


def test_logout_invalidates_session(client):
    csrf = register_user(client)
    response = client.post("/api/v1/auth/logout", headers={"X-CSRF-Token": csrf})
    assert response.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 401


def test_profile_update_and_password_change_require_csrf(client):
    csrf = register_user(client)
    profile = client.patch(
        "/api/v1/auth/profile",
        json={"name": "Updated User"},
        headers={"X-CSRF-Token": csrf},
    )
    assert profile.status_code == 200
    assert profile.json()["user"]["name"] == "Updated User"
    assert client.patch("/api/v1/auth/profile", json={"name": "No CSRF"}).status_code == 403

    changed = client.post(
        "/api/v1/auth/password",
        json={"current_password": "correct horse battery staple", "new_password": "another-strong-password"},
        headers={"X-CSRF-Token": csrf},
    )
    assert changed.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 200
    assert client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "another-strong-password"},
    ).status_code == 200


def test_google_provider_reports_disabled_until_credentials_are_configured(client, monkeypatch):
    monkeypatch.setattr("app.main.settings.google_client_id", "")
    monkeypatch.setattr("app.main.settings.google_client_secret", "")
    monkeypatch.setattr("app.main.settings.google_redirect_uri", "")
    assert client.get("/api/v1/auth/providers").json() == {"google": False}
    response = client.get("/api/v1/auth/google/start", follow_redirects=False)
    assert response.status_code == 303
    assert response.headers["location"].endswith("/ar/login?auth_error=GOOGLE_NOT_CONFIGURED")
