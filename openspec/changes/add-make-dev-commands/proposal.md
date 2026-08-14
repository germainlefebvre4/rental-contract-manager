## Why

Starting the project today requires the developer to remember and run two separate commands in two separate terminals (`cd backend && go run ./main.go`, `cd frontend && pnpm start`), and there is no single, discoverable way to run either service on a non-default port without hand-editing `.env` files. This adds friction for local development and for running multiple instances of the stack side by side (e.g. testing against a second checkout).

## What Changes

- Add a root `Makefile` with three targets:
  - `make dev-backend`: starts the Go backend (`go run ./main.go`) on a configurable port.
  - `make dev-frontend`: starts the React dev server (`pnpm start`) on a configurable port, pointed at the correct backend URL.
  - `make dev`: runs `dev-backend` and `dev-frontend` concurrently in one terminal, and stops both cleanly on Ctrl+C.
- Introduce two Make variables, overridable on the command line, with defaults matching the current `.env` files:
  - `API_PORT` (default `8000`): backend listen port.
  - `FRONTEND_PORT` (default `3000`): frontend dev server port.
- `dev-frontend` derives `REACT_APP_API_URL` from `API_PORT` at launch time (`http://localhost:$(API_PORT)/api`) so the frontend always calls the backend on the port it was actually started with, without editing `frontend/.env`.
- `make dev`, `make dev-backend`, and `make dev-frontend` do not manage the database; the developer continues to run `docker compose up -d` separately, as documented today.
- `.env` files on disk are left untouched — port/URL overrides apply only to the environment of the process Make launches, for that invocation.

## Capabilities

### New Capabilities
- `dev-workflow`: Make-based local development commands (`dev`, `dev-backend`, `dev-frontend`) with configurable, coupled backend/frontend ports.

### Modified Capabilities
(none — this is new tooling, no existing spec covers local dev commands)

## Impact

- Affected files: new root `Makefile`; `README.md` updated to document the new commands (as part of tasks, not this proposal).
- No changes to application code, `backend/.env`, `frontend/.env`, or Docker Compose files.
- No breaking changes: existing manual startup commands (`go run ./main.go`, `pnpm start`) keep working exactly as before.
