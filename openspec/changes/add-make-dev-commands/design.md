## Context

No Makefile exists in the repo today. The backend (Go/Gin) reads its listen port from the `PORT` env var via `godotenv`-loaded config (`backend/config/config.go`, default `8000`). The frontend (Create React App via `react-scripts`) also reads `PORT` natively for `pnpm start` (default `3000`, set in `frontend/.env`), and separately reads `REACT_APP_API_URL` (also in `frontend/.env`) to know which backend URL to call via axios. Backend CORS currently allows all origins (`Access-Control-Allow-Origin: *`), so frontend port changes don't require any backend CORS change. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One Makefile, three targets (`dev`, `dev-backend`, `dev-frontend`), no new runtime dependency.
- `API_PORT` and `FRONTEND_PORT` are the only two variables a developer needs to know.
- `make dev-backend` and `make dev-frontend` behave identically whether run standalone or as part of `make dev`.

**Non-Goals:**
- Managing the database lifecycle from `make dev` (developer keeps running `docker compose up -d` separately, per the existing README flow).
- Hot-reloading orchestration, log multiplexing tools (e.g. overmind/foreman), or a Procfile — plain `make -j` is sufficient for two processes.
- Changing CORS behavior, `.env.example` defaults, or Docker Compose files.

## Decisions

**Variable naming: `API_PORT` / `FRONTEND_PORT`, mapped to `PORT` per recipe.**
Both the Go backend and `react-scripts` read a `PORT` env var natively. Naming the Makefile variables `API_PORT` and `FRONTEND_PORT` (per the user's request) avoids implying a single shared `PORT`, and each recipe exports its own `PORT=` locally to its recipe line (`cd backend && PORT=$(API_PORT) go run ./main.go`). Because each target's recipe runs in its own subshell, there is no risk of one target's `PORT` export leaking into the other's, even when both run under `make -j2`.
Alternative considered: a single `PORT` variable shared by both services — rejected because the user explicitly wants independent backend/frontend ports, and a shared name invites exactly the collision this decision avoids.

**Concurrency: `make -j2` over a recipe with `&`/`wait`, over an external tool.**
`make dev: ; $(MAKE) -j2 dev-backend dev-frontend` lets `make`'s own job server manage the two child processes, interleaving their stdout/stderr in one terminal. Command-line-set variables (e.g. `API_PORT=8080 make dev`) are automatically passed through to the recursive `$(MAKE)` invocation, so overrides reach both sub-targets without extra plumbing.
Alternative considered: backgrounding both commands with `&` and `wait` in a single recipe — works, but requires manual PID tracking and an explicit `trap ... EXIT` to avoid orphaned processes; `make -j2` gets equivalent behavior for free from `make` itself.
Alternative considered: an external process manager (overmind/foreman/Procfile) — rejected as an unnecessary dependency for two processes; adds an install step for every contributor.

**Ctrl+C cleanup: rely on foreground process-group signal delivery, called out as a known limitation.**
When a user Ctrl+C's a foreground `make -j2`, the terminal sends `SIGINT` to the whole foreground process group, which normally reaches `make` and its running child jobs (`go run`, `pnpm start`) together. This covers the common case without extra scripting. `go run` itself spawns a compiled child binary; on most systems the child is in the same process group and receives `SIGINT` too, but this is a known soft spot rather than a guarantee enforced by the Makefile.
Alternative considered: an explicit `trap 'kill 0' INT TERM EXIT` in each recipe — more robust, but adds complexity for a dev-only convenience tool. Left as a follow-up if orphaned `go run` child processes turn out to be a real problem in practice (see Risks below).

**API URL wiring: compute `REACT_APP_API_URL` from `API_PORT` at launch, don't touch `frontend/.env`.**
`dev-frontend`'s recipe exports `REACT_APP_API_URL=http://localhost:$(API_PORT)/api` alongside `PORT=$(FRONTEND_PORT)` when invoking `pnpm start`. CRA's dev server picks up env vars present in the process environment at startup, overriding whatever `frontend/.env` has on disk, without editing that file. This keeps `API_PORT` as the single source of truth for "which port is the backend on" from the frontend's perspective, per proposal.md.
Alternative considered: requiring the developer to also update `frontend/.env` manually when changing `API_PORT` — rejected per earlier discussion, since it silently breaks the frontend-to-backend calls if forgotten.

**Database stays out of scope.**
`make dev` does not run `docker compose up -d`. This matches today's documented three-step README flow and keeps the Makefile's blast radius limited to the two application processes, per user's explicit choice during exploration.

## Risks / Trade-offs

- [Orphaned `go run` child process after Ctrl+C on some platforms/shells] → Not mitigated in this change; if observed in practice, add an explicit `trap 'kill 0'` to the `dev` recipe as a follow-up.
- [Developer runs `dev-backend` and `dev-frontend` in two separate terminals instead of `make dev`, using different `API_PORT` values in each] → Frontend will call whichever `API_PORT` it was started with; this is expected/documented behavior, not a bug, since the two invocations are independent by design.
- [`make -j2` interleaves backend and frontend logs in one stream] → Acceptable for a dev convenience command; each log line still carries its own program's natural prefix (Gin's request logs vs. webpack/CRA output) so they remain distinguishable.
