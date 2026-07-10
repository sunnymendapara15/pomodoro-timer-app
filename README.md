# Pomodoro Timer App

A polished Pomodoro timer built with React. It now sits behind a FastAPI login/signup experience so each focus session is tied to an authenticated user (Task 1 implementation).

## Getting started

### Backend (FastAPI)
1. Copy `backend/.env.example` to `backend/.env` and adjust the secrets as needed.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```
3. Run the API:
   ```bash
   uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend creates `backend.db` (SQLite) automatically and exposes `/api/register`, `/api/login`, and `/api/me`.

### Frontend (React)
1. Enter the frontend directory and install npm dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Set the API base URL via `.env.local` or an environment variable (defaults to `http://localhost:8000/api`).
3. Start the development server:
   ```bash
   npm start
   ```

The React app demands authentication before exposing the Pomodoro timer, and it stores the JWT in `localStorage`.

## Environment variables

### Backend
| Name | Description |
| --- | --- |
| `SECRET_KEY` | Secret for signing JWTs (change for production). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutes until tokens expire (default `60`). |
| `DATABASE_URL` | Database connection string (default `sqlite:///./backend.db`). |
| `CORS_ORIGINS` | Comma-separated origins allowed to talk to the API (default `http://localhost:3000`). |

### Frontend
| Name | Description |
| --- | --- |
| `REACT_APP_API_BASE_URL` | Base URL for the FastAPI endpoints (default `http://localhost:8000/api`). |

## Authentication flow

- `POST /api/register` creates a user and returns a bearer token plus user metadata.
- `POST /api/login` validates credentials and issues a new token.
- Authenticated sessions can call `/api/me` to confirm identity before the timer and settings appear.

The timer UI remains locked until login/signup succeeds; after that the existing session logs, timer, controls, and customization options behave exactly as before.
