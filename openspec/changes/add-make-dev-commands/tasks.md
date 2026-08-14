## 1. Makefile

- [x] 1.1 Create root `Makefile` with `API_PORT ?= 8000` and `FRONTEND_PORT ?= 3000` variables
- [x] 1.2 Add `dev-backend` target: `cd backend && PORT=$(API_PORT) go run ./main.go`
- [x] 1.3 Add `dev-frontend` target: `cd frontend && PORT=$(FRONTEND_PORT) REACT_APP_API_URL=http://localhost:$(API_PORT)/api pnpm start`
- [x] 1.4 Add `dev` target that runs `dev-backend` and `dev-frontend` concurrently via `$(MAKE) -j2 dev-backend dev-frontend`
- [x] 1.5 Mark `dev`, `dev-backend`, `dev-frontend` as `.PHONY`

## 2. Verification

- [x] 2.1 Run `make dev-backend` alone, confirm backend listens on `8000` by default and no frontend process starts
- [x] 2.2 Run `make dev-frontend` alone, confirm frontend listens on `3000` by default, no backend process starts, and it calls `http://localhost:8000/api`
- [x] 2.3 Run `make dev` with defaults, confirm both services start, are reachable, and interrupting with Ctrl+C stops both
- [x] 2.4 Run `FRONTEND_PORT=5172 API_PORT=8080 make dev`, confirm backend listens on `8080`, frontend listens on `5172`, and the frontend calls `http://localhost:8080/api`
- [x] 2.5 After an overridden-port run, diff `backend/.env` and `frontend/.env` against git to confirm neither file was modified

## 3. Documentation

- [x] 3.1 Update `README.md` "Getting Started" section to document `make dev`, `make dev-backend`, `make dev-frontend`, and the `API_PORT` / `FRONTEND_PORT` variables, alongside the existing manual startup instructions
