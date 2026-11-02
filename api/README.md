# AMAL API

Python 3.11–3.13, FastAPI, Pydantic, Uvicorn, SQLite, and in-memory request limiting. Accounts are required for assessments. Submitted assessment text and answers are stored in the owning user's history so they can be revisited or deleted. Passwords are stored as scrypt hashes; request logs do not contain assessment text or credentials.

## Local setup

```powershell
cd api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[test]"
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Run the React app in another terminal with `npm run dev`. Vite proxies `/api`, `/health`, and `/ready` to `http://127.0.0.1:8000`; override `AMAL_API_URL` for another backend URL.

## Endpoints

| Method | Route | Purpose | Authentication |
| --- | --- | --- | --- |
| GET | `/health` | Process liveness | None |
| GET | `/ready` | Model readiness; returns 503 until reviewed model assets are installed | None |
| POST | `/api/v1/auth/register` | Creates an account and session | None |
| POST | `/api/v1/auth/login` | Starts an account session | None |
| GET | `/api/v1/auth/providers` | Lists configured social sign-in providers | None |
| GET | `/api/v1/auth/google/start` | Starts Google OpenID Connect sign-in | None |
| GET | `/api/v1/auth/google/callback` | Validates Google's callback and creates a session | OAuth state cookie |
| GET | `/api/v1/auth/me` | Returns the signed-in account | Session cookie |
| PATCH | `/api/v1/auth/profile` | Updates the current account's display name | Session + CSRF |
| POST | `/api/v1/auth/password` | Changes password and revokes other sessions | Session + CSRF |
| POST | `/api/v1/auth/logout` | Ends the current session | Session + CSRF |
| GET | `/api/v1/assessments` | Lists the current user's saved history | Session cookie |
| DELETE | `/api/v1/assessments` | Deletes the current user's saved assessment history | Session + CSRF |
| POST | `/api/v1/analysis/text` | Saves assessment; abstains on insufficient input, otherwise returns 503 until an approved model adapter exists | Session + CSRF |
| POST | `/api/v1/analysis/claims` | Claim verification boundary; returns 503 until authoritative evidence integration exists | Session + CSRF |
| POST | `/api/v1/analysis/multimodal` | Multimodal inference boundary; returns 503 until model assets exist | Session + CSRF |
| POST | `/api/v1/assistant/messages` | Assistant boundary; returns 503 until a privacy-reviewed provider exists | Session + CSRF |

Errors use `{ "error": { "code", "message", "request_id" } }`. Request bodies are rejected without echoing submitted values. Successful responses include `X-Request-ID` and `Cache-Control: no-store`.

## Environment

See `.env.example` for application settings. Google sign-in is enabled only when `AMAL_GOOGLE_CLIENT_ID`, `AMAL_GOOGLE_CLIENT_SECRET`, and `AMAL_GOOGLE_REDIRECT_URI` are all set. Create an OAuth client of type **Web application** and register the redirect URI exactly as configured. Keep the client secret on the API server. The flow uses a short-lived, HTTP-only state and nonce cookie, verifies the Google ID token on the server, and requires a verified email. `AMAL_FRONTEND_URL` is the post-login redirect origin. Set the database path to durable storage in deployments. Use HTTPS in production; session cookies are `HttpOnly`, `SameSite=Strict`, and `Secure` in production. Rate limits are process-local and should be paired with a deployment-level limit if multiple workers are introduced.

## Tests

```powershell
python -m pytest
```

## Model integration gate

No dataset, trained model weights, calibration artifact, model manifest, or evidence-provider credentials are in this repository. The API deliberately refuses to manufacture predictions. Before enabling inference, add the reviewed `salam_nlp` adapter and verified manifest described in `docs/backend-architecture.md`, implement readiness from successful artifact verification, and add model evaluation and safety approval artifacts. The API currently provides a real integration boundary, not production inference readiness.
