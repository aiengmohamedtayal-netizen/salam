import os

import pytest
from fastapi.testclient import TestClient

os.environ["AMAL_ENV"] = "test"

from app.config import settings
from app.main import app, limiter


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "database_path", str(tmp_path / "amal.sqlite3"))
    limiter._storage.reset()
    with TestClient(app) as test_client:
        yield test_client


def register_user(client, email="test@example.com", password="correct horse battery staple"):
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": email, "password": password},
    )
    assert response.status_code == 200, response.text
    return response.json()["csrf_token"]
