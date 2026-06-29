# Backend API and Authentication Validation

Status: Passed on 2026-06-29.

Technical compilation and focused auth unit tests passed with:

```sh
GOCACHE=/Users/dinomeschini/Documents/final_ing_soft_aplicada/.gocache go test ./...
```

Backend verification also passed through the root Makefile:

```sh
make backend-test
```

The checks cover email canonicalization, expired-token rejection, health routing, and missing-bearer-token rejection.

The DB-only Compose validation configuration renders successfully with:

```sh
docker compose -p todolist-validation -f deploy/docker-compose.yml --profile validation config
```

Runtime PostgreSQL/HTTP smoke validation passed after starting Colima and using the DB-only validation Compose project.

The validation database was published on `localhost:54339` because `54329` was already occupied by an unrelated `hrapp-db-1` container.

Passed runtime commands:

```sh
make db-reset
make migrate-up
GOCACHE=/Users/dinomeschini/Documents/final_ing_soft_aplicada/.gocache make api-dev
make db-down
```

Follow-up lifecycle fix:

```sh
make api-up
make api-status
make api-down
make validation-down
```

Future validation runs should use `make api-up`, `make api-down`, and `make validation-down` so the Makefile owns API process startup and cleanup.

The HTTP smoke flow passed for health, registration, authentication, missing-token rejection, invalid-token rejection, todo list CRUD, task CRUD, tag CRUD, task-tag assignment, and cross-user ownership rejection.

## Manual Validation

Run the API against a PostgreSQL database with the existing migrations applied.

Recommended manual checks:

1. Call `GET /health` and confirm it returns success JSON.
2. Register user A through `POST /api/register`.
3. Authenticate user A through `POST /api/authenticate` and store the JWT.
4. Confirm `GET /api/todo-lists` without a token returns `401`.
5. Confirm `GET /api/todo-lists` with a malformed, tampered, or expired token returns `401`.
6. Create a todo list with user A's token.
7. Create a task in that todo list.
8. Create a tag for user A.
9. Assign the tag to the task.
10. List todo lists, tasks, and tags and confirm the created data is present.
11. Update and delete at least one todo list, task, and tag.
12. Register and authenticate user B.
13. Try to access or mutate user A's resources with user B's token and confirm the API returns `404`.

## Technical Checks

Run from `backend`:

```sh
go test ./...
```

If a local PostgreSQL database is available, run migrations before API smoke testing:

```sh
make db-up
make migrate-up
```

Then run the API with environment variables similar to:

```sh
make api-up
```

## Expected Unit and E2E Tests

- Milestone 2 does not require the formal backend unit-test count; Milestone 3 owns that requirement.
- Any auth or handler tests added during implementation should run under `go test ./...`.
- Playwright E2E coverage is not required until Milestone 4.

## Responsive and Accessibility Checks

- Not applicable. This milestone has no user-facing UI.

## Closure Criteria

- Backend compiles and tests pass with `go test ./...`.
- The API can connect to PostgreSQL using environment configuration.
- Registration and authentication work end to end.
- Protected routes reject missing or invalid JWTs.
- CRUD behavior can be verified with HTTP requests.
- Ownership checks are manually verified with two users.
- `specs/roadmap.md` is updated only after implementation and validation pass.
