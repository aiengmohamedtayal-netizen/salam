import json
from pathlib import Path

from app.main import app


def test_health_is_available(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_readiness_refuses_missing_model(client):
    response = client.get("/ready")
    assert response.status_code == 503
    assert response.json()["reason"] == "MODEL_ARTIFACT_UNAVAILABLE"


def test_analysis_does_not_fabricate_a_prediction_without_model(client):
    from conftest import register_user

    csrf = register_user(client)
    response = client.post(
        "/api/v1/analysis/text",
        json={"text": "أشعر بالضغط وأحاول تنظيم يومي والتواصل مع أصدقائي", "language": "ar"},
        headers={"X-CSRF-Token": csrf},
    )
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "MODEL_UNAVAILABLE"
    assert "أشعر بالضغط" not in response.text


def test_validation_errors_do_not_echo_input(client):
    from conftest import register_user

    csrf = register_user(client)
    secret = "private reflection text 123"
    response = client.post("/api/v1/analysis/text", json={"text": secret, "unexpected": "value"}, headers={"X-CSRF-Token": csrf})
    assert response.status_code == 422
    assert secret not in response.text
    assert "INVALID_REQUEST" in response.text


def test_short_text_is_abstained_without_an_estimate(client):
    from conftest import register_user

    csrf = register_user(client)
    response = client.post("/api/v1/analysis/text", json={"text": "كلمتين فقط", "language": "ar"}, headers={"X-CSRF-Token": csrf})
    assert response.status_code == 200
    assert response.json()["status"] == "insufficient_input"


def test_checked_in_openapi_contract_matches_application():
    contract_path = Path(__file__).resolve().parents[2] / "contracts" / "openapi.json"
    assert json.loads(contract_path.read_text(encoding="utf-8")) == app.openapi()

