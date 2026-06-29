# Backend Quality and Runtime Validation Requirements

## Functional Requirements

- The validation process must use the existing backend API implementation.
- The backend must connect to a PostgreSQL database through environment configuration.
- Existing migrations in `backend/migrations` must be applied before HTTP validation.
- A root-level `Makefile` must provide simple backend test and local database lifecycle commands.
- The local database start command must start PostgreSQL 16 for backend validation.
- The local database stop command must remove orphan Compose services.
- `GET /health` must return a successful JSON response while the API is running.
- `POST /api/register` must create a user with an email and password.
- `POST /api/authenticate` must return a JWT for valid credentials.
- Protected endpoints must reject requests without a valid bearer token with `401`.
- A valid authenticated user must be able to create, list, read, update, and delete todo lists.
- A valid authenticated user must be able to create, list, read, update, and delete tasks in their own todo lists.
- A valid authenticated user must be able to create, list, read, update, and delete tags.
- A valid authenticated user must be able to assign their own tags to their own tasks.
- A second user must not be able to access or mutate the first user's todo lists, tasks, tags, or task-tag assignments.
- The backend must include at least two focused Go tests.
- At least one backend test must cover non-trivial logic such as JWT validation, request validation, handler behavior, ownership behavior, or domain mapping.

## Non-Functional Requirements

- Validation must be repeatable from documented commands.
- Validation must not depend on committed secrets.
- Validation must not modify binary presentation files or local assignment-reference material.
- Any code fix made during this slice must remain narrowly scoped to Milestone 2 backend behavior.
- Existing migrations must remain append-only.
- Backend tests must pass with `go test ./...` from the `backend` directory.
- Makefile commands must stay small, readable, and aligned with the current repository layout.
- Docker/Compose changes must not claim full Milestone 5 completion unless the API, web app, database, and observability stack are all runnable.

## Content and Data Requirements

- Validation should use disposable local test users.
- Test user email addresses should be clearly artificial and safe to discard.
- Todo list, task, and tag records created during validation should use simple names that make HTTP responses easy to inspect.
- JWT secrets and database passwords must be supplied through environment variables or local-only shell values, not committed files.
- Documentation must distinguish DB-only validation infrastructure from the later full Dockerized runtime milestone.

## Acceptance Criteria

- Backend tests pass locally with `go test ./...`.
- Backend tests include at least two focused tests, with one covering non-trivial logic.
- The backend test command is documented for developer and CI reuse.
- `make backend-test` or an equivalent Makefile target runs the backend tests.
- `make db-up` or an equivalent Makefile target starts a local PostgreSQL validation database.
- `make db-down` or an equivalent Makefile target stops the validation database and removes orphans.
- PostgreSQL is available for validation.
- Migrations apply successfully to a clean validation database.
- The API starts and connects to the validation database.
- Health, registration, login, protected-route rejection, CRUD, tag assignment, and ownership checks pass through HTTP requests.
- The actual validation commands and results are recorded in `specs/2026-06-29-backend-api-auth/validation.md`.
- `specs/roadmap.md` marks Milestone 2 and Milestone 3 complete only after their closure criteria pass.
