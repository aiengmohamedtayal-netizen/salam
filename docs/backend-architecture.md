# AMAL backend requirements and implementation status

## Current decisions

- Modular monolith: React + Vite frontend and Python FastAPI backend.
- Accounts are required for assessment pages. Registration stores a name, normalized email, and scrypt password hash. Passwords are never stored in plain text.
- Each account has a persistent assessment history containing submitted text, answers, language, timestamp, and processing status. Users can view, reuse, and delete their own history.
- Session IDs are random, stored only as SHA-256 hashes in SQLite, and sent in HttpOnly, SameSite cookies. Mutating authenticated requests use a double-submit CSRF token.
- Request logs exclude submitted text and passwords. API errors do not echo request bodies. Stored assessment text is sensitive account data; the privacy page explains this and warns users not to submit content they do not want saved.
- The prediction policy must be reviewed and deterministic, support abstention, and never have a model author guidance or crisis responses. A model must never produce fabricated predictions.

## Current architecture

`React/Vite → same-origin /api proxy → FastAPI → auth/session checks → SQLite accounts/history → reviewed model boundary`

The SQLite file path is configurable with `AMAL_DATABASE_PATH`. For container deployment, mount persistent storage at the configured path. Health and model readiness are separate. The Cairo font is bundled locally.

## Implemented contracts

| Method and route | Purpose |
| --- | --- |
| `GET /health` | Liveness |
| `GET /ready` | Returns 503 until verified model assets are installed |
| `POST /api/v1/auth/register` | Creates an account and authenticated session |
| `POST /api/v1/auth/login` | Verifies credentials and creates a session |
| `GET /api/v1/auth/me` | Returns the current account |
| `POST /api/v1/auth/logout` | Invalidates the current session; requires CSRF token |
| `GET /api/v1/assessments` | Lists only the signed-in user's assessment history |
| `DELETE /api/v1/assessments` | Deletes only the signed-in user's assessment history; requires CSRF token |
| `POST /api/v1/analysis/text` | Requires authentication and CSRF; saves the submitted assessment. Abstains on insufficient input, otherwise returns 503 until reviewed model assets are supplied |
| `POST /api/v1/analysis/claims` | Requires authentication and CSRF; returns 503 until evidence integration exists |
| `POST /api/v1/analysis/multimodal` | Requires authentication and CSRF; returns 503 until model assets exist |
| `POST /api/v1/assistant/messages` | Requires authentication and CSRF; returns 503 until an approved provider exists |

All errors are sanitized and include a request ID. Successful responses use `Cache-Control: no-store`. The database stores persistent assessment history by design; that content is excluded from request logs.

## Frontend behavior

Assessment and direct text-analysis pages redirect signed-out visitors to login, then return them to the requested path. The assessment page shows saved history and supports restoring text and deleting history. Assessment records currently carry `insufficient_input` or `model_unavailable`; no model result can be generated until approved weights, data, and evaluation artifacts arrive.

## Remaining model inputs

No training dataset, trained model weights, evaluation protocol results, manifest, calibrated thresholds, XAI implementation, crisis policy approval, authoritative claim sources, or reviewed assistant provider are included. The API intentionally does not invent results. These are required before `/ready` reports ready and predictive output can be shown.

## Run and deploy

See [api/README.md](../api/README.md). Run Uvicorn on port 8000 and Vite on port 5173. Production requires an explicit `AMAL_ENV=production`, HTTPS frontend and allowed origins, a dedicated durable database directory, and encrypted persistent storage and backups for sensitive assessment text. On POSIX systems the API applies owner-only permissions to its SQLite data directory and database file. Use a shared gateway rate limit with multiple workers or replicas. Do not use `/health` as model readiness; check `/ready`.
