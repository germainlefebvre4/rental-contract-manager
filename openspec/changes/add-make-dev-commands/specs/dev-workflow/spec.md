## Purpose

Gives developers a single, discoverable set of `make` commands to start the backend and frontend for local development, with the listen ports configurable per invocation instead of requiring manual `.env` edits.

## ADDED Requirements

### Requirement: Unified dev startup command
The system SHALL provide a `make dev` command that starts both the backend and the frontend development servers concurrently from a single invocation, and stops both processes when the user interrupts it (e.g. Ctrl+C).

#### Scenario: Starting both services
- **WHEN** the developer runs `make dev` with the database already running
- **THEN** both the backend server and the frontend dev server start and become reachable on their respective ports, with output from both visible in the same terminal

#### Scenario: Stopping both services together
- **WHEN** the developer interrupts a running `make dev` with Ctrl+C
- **THEN** both the backend process and the frontend process are terminated; no backend or frontend process is left running in the background

### Requirement: Independent service startup commands
The system SHALL provide `make dev-backend` and `make dev-frontend` commands that each start only their respective service, independently of the other.

#### Scenario: Starting only the backend
- **WHEN** the developer runs `make dev-backend`
- **THEN** only the backend server starts; no frontend process is started

#### Scenario: Starting only the frontend
- **WHEN** the developer runs `make dev-frontend`
- **THEN** only the frontend dev server starts; no backend process is started

### Requirement: Configurable service ports
The system SHALL allow the backend and frontend listen ports to be configured independently via the `API_PORT` and `FRONTEND_PORT` variables, overridable on the `make` command line, defaulting to `8000` and `3000` respectively when not specified.

#### Scenario: Default ports
- **WHEN** the developer runs `make dev` (or `dev-backend` / `dev-frontend`) without specifying ports
- **THEN** the backend listens on port `8000` and the frontend dev server listens on port `3000`

#### Scenario: Overriding both ports
- **WHEN** the developer runs `FRONTEND_PORT=5172 API_PORT=8080 make dev`
- **THEN** the backend listens on port `8080` and the frontend dev server listens on port `5172`

#### Scenario: Overriding a single port for one service
- **WHEN** the developer runs `API_PORT=9000 make dev-backend`
- **THEN** the backend listens on port `9000`, and the value of `FRONTEND_PORT` has no effect on this command

### Requirement: Frontend API URL follows the configured backend port
The system SHALL configure the frontend dev server so that its API base URL points at `http://localhost:<API_PORT>/api`, using the effective value of `API_PORT` for that invocation, so the frontend always calls the backend port it was actually started with.

#### Scenario: Backend port overridden while starting the frontend
- **WHEN** the developer runs `API_PORT=8080 make dev` or `API_PORT=8080 make dev-frontend`
- **THEN** the running frontend dev server calls the backend API at `http://localhost:8080/api`

#### Scenario: No override
- **WHEN** the developer runs `make dev` or `make dev-frontend` without setting `API_PORT`
- **THEN** the running frontend dev server calls the backend API at `http://localhost:8000/api`

### Requirement: Configuration files remain unmodified
The system SHALL apply port and API URL configuration only to the environment of the processes launched by `make`, without writing to `backend/.env` or `frontend/.env`.

#### Scenario: Running with overridden ports
- **WHEN** the developer runs `FRONTEND_PORT=5172 API_PORT=8080 make dev`
- **THEN** the contents of `backend/.env` and `frontend/.env` on disk are unchanged after the command runs
