# Backend Quality and Runtime Validation Plan

Status: Implemented and validated on 2026-06-29.

## Objective

Close the pending Milestone 2 runtime validation gap and complete the Milestone 3 backend unit-test requirement without moving ahead to frontend, full Docker runtime, or observability work.

## Scope

- Review the current backend API implementation only as needed to understand startup configuration and endpoint behavior.
- Add focused backend unit tests for non-trivial logic and HTTP/API behavior.
- Create a repeatable local validation path for the existing Gin, GORM, JWT, and PostgreSQL backend.
- Add a minimal developer `Makefile` for backend test and local database lifecycle commands.
- Add or refine Docker Compose configuration only for the PostgreSQL database needed by backend validation.
- Ensure local stop/down commands remove orphans so validation containers and ports do not get stuck.
- Run the existing migrations against PostgreSQL.
- Start the API with explicit local environment variables.
- Exercise the health, registration, authentication, protected-route, CRUD, task-tag assignment, and ownership-check flows through HTTP requests.
- Record the validation outcome in the Milestone 2 validation notes.
- Document backend test commands for Milestone 3.
- Update `specs/roadmap.md` only if the relevant Milestone 2 and Milestone 3 closure criteria are fully met.

## Out of Scope

- Adding new product capabilities beyond the existing Milestone 2 API.
- Building the React web app, Ionic PWA, full application Docker runtime, observability stack, or CI pipeline.
- Dockerizing the API or web app.
- Starting Loki, Alloy, Grafana, or web containers.
- Changing binary presentation files or local assignment-reference files.

## Proposed Architecture

This slice should validate the existing backend in place:

```text
backend/
├── cmd/api/main.go
├── internal/
│   ├── auth/
│   ├── config/
│   ├── database/
│   ├── domain/
│   ├── handlers/
│   └── middleware/
└── migrations/
```

PostgreSQL remains the source of runtime truth. SQL migrations should be applied before the API starts. The API should connect through its existing environment-driven configuration and should not rely on GORM auto-migration for production-like validation.

The full Dockerized application belongs to Milestone 5. This slice may still introduce a DB-only Compose path and `Makefile` commands because Milestone 2 cannot be validated responsibly without a repeatable PostgreSQL runtime. That should be treated as test/development infrastructure, not completion of the Dockerized runtime milestone.

Suggested Makefile surface:

```text
make backend-test     # run Go tests from backend
make db-up            # start PostgreSQL validation container
make db-down          # stop PostgreSQL and remove orphans
make db-reset         # recreate the validation database volume when needed
make api-up           # start the API against the local validation database
make api-down         # stop the API started by make api-up
make validation-down  # stop API and validation database
```

If Docker is available, use a local PostgreSQL 16 service through Compose. If Docker is unavailable, document the exact blocker and leave clear commands for manual validation.

## Implementation Steps

1. Inspect backend configuration and handler behavior to confirm required environment variables and endpoint payload shapes.
2. Add or update focused backend tests so Milestone 3 has at least two meaningful Go unit tests, including at least one non-trivial JWT, validation, handler, or mapping test.
3. Add a root `Makefile` with narrow backend/database commands.
4. Refine `deploy/docker-compose.yml` or add a clearly scoped Compose file so `make db-up` starts only PostgreSQL for validation and `make db-down` removes orphans.
5. Start or connect to a PostgreSQL 16 database for local validation.
6. Apply `backend/migrations` to the validation database.
7. Run backend tests from `backend` with `go test ./...`.
8. Start the API with local `DATABASE_URL` and `JWT_SECRET` values.
9. Run HTTP smoke checks for:
   - `GET /health`
   - `POST /api/register`
   - `POST /api/authenticate`
   - missing or invalid JWT rejection on protected endpoints
   - todo list CRUD
   - task CRUD
   - tag CRUD
   - task-tag assignment
   - cross-user ownership rejection
10. Fix only defects that prevent Milestone 2 or Milestone 3 acceptance criteria from passing.
11. Re-run the relevant validation checks after any fix.
12. Update `specs/2026-06-29-backend-api-auth/validation.md` with the actual runtime commands and result.
13. Update README or developer notes with the backend test command and Makefile commands.
14. Mark Milestone 2 and/or Milestone 3 complete in `specs/roadmap.md` only if their closure criteria pass.

## Risks and Decisions

- The previous Milestone 2 validation was blocked because Docker, `psql`, and `migrate` were unavailable in the agent environment.
- If local Docker is still unavailable, validation may require user-provided PostgreSQL access or approval to use an existing database service.
- Runtime validation may uncover implementation bugs. Fixes should stay narrowly scoped to Milestone 2 acceptance criteria.
- A DB-only Compose setup is useful now, but the full application Docker milestone should remain Milestone 5.
- The Makefile should make local cleanup explicit by using Compose down/remove-orphans behavior so stuck ports and orphan services are less likely.
- Any validation script or helper added to the repo should avoid secrets and use documented environment variables.

## Expected Result

Milestone 2 is closed when migrations apply cleanly to PostgreSQL, the API starts against that database, authenticated CRUD works through HTTP, protected endpoints reject invalid access, and ownership checks prevent one user from accessing another user's todo data.

Milestone 3 is closed when focused Go backend tests exist, `go test ./...` passes locally, and the backend test command is documented for CI reuse.
