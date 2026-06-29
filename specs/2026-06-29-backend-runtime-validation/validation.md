# Backend Quality and Runtime Validation

Status: Passed on 2026-06-29.

Implemented repeatable backend validation commands:

- `make backend-test`
- `make db-up`
- `make migrate-up`
- `make db-down`
- `make db-reset`
- `make api-dev`
- `make api-up`
- `make api-down`
- `make api-status`
- `make validation-down`

Actual results from this environment:

- `make backend-test` passed.
- `docker compose -p todolist-validation -f deploy/docker-compose.yml --profile validation config` passed.
- `colima start` was required because Docker was initially stopped.
- `make db-reset` passed after moving the validation PostgreSQL port from `54329` to `54339`; `54329` was already used by an unrelated `hrapp-db-1` container.
- `make migrate-up` passed and applied all current versioned migrations.
- `make api-dev` started the API against PostgreSQL on `localhost:54339` during the initial validation run.
- After review, managed API lifecycle targets were added so future validations can use `make api-up` and `make api-down` instead of manually locating and killing processes.
- `make api-up` was verified to start a persistent API process, write `.api-dev.pid`, write `.api-dev.log`, and serve `GET /health`.
- `make api-down` was verified to stop the managed API process and clear port `8080`.
- `make validation-down` was verified to stop the API if needed and remove the validation database container/network.
- HTTP smoke validation passed for health, registration, authentication, missing-token rejection, invalid-token rejection, todo list CRUD, task CRUD, tag CRUD, task-tag assignment, and cross-user ownership rejection.
- `make db-down` passed and removed the `todolist-validation` validation container and network.
- The validation database commands use a dedicated Compose project name, `todolist-validation`, so `make db-down` and `make db-reset` do not target containers from the future full application stack.
- `make migrate-up` applies all versioned `/migrations/*.up.sql` files in lexical order inside the database container.

Validation disposable records used:

- User A: `validation-a-1782750456@example.test`
- User B: `validation-b-1782750456@example.test`
- Todo list ID: `1`
- Task ID: `1`
- Tag ID: `1`

Those records were deleted during the smoke test, then the validation container was stopped.

## Manual Validation

These checks passed during validation.

1. Start or connect to PostgreSQL 16.
2. Create a clean validation database.
3. Apply the existing backend migrations.
4. Start the API with `DATABASE_URL` and `JWT_SECRET`.
5. Confirm `GET /health` succeeds.
6. Register user A.
7. Authenticate user A and store the returned JWT.
8. Confirm a protected endpoint without a JWT returns `401`.
9. Confirm a protected endpoint with an invalid JWT returns `401`.
10. Create, list, read, update, and delete a todo list as user A.
11. Create, list, read, update, and delete a task in user A's todo list.
12. Create, list, read, update, and delete a tag as user A.
13. Assign user A's tag to user A's task.
14. Register and authenticate user B.
15. Attempt to access or mutate user A's resources with user B's JWT and confirm the API returns `404` or another ownership-safe failure documented by the existing API contract.
16. Stop the validation database with the documented Makefile command and confirm Compose removes orphans.

## Technical Checks

Run backend tests through the Makefile target:

```sh
make backend-test
```

This target is equivalent to running from `backend`:

```sh
go test ./...
```

Start the local validation database:

```sh
make db-up
```

Apply migrations through the database container:

```sh
make migrate-up
```

Start the API with local-only environment values from the repository root:

```sh
make api-up
make api-status
```

Stop the API and validation database without manual process cleanup:

```sh
make validation-down
```

Use HTTP requests to verify the endpoint behavior. The exact request commands should be recorded after execution so the evaluator can reproduce the successful path.

## Expected Unit and E2E Tests

- Backend tests must pass with `go test ./...`.
- At least two focused Go tests must exist for Milestone 3.
- At least one test must cover non-trivial logic such as JWT validation, request validation, handler behavior, ownership behavior, or domain mapping.
- Current backend tests cover email canonicalization, expired-token rejection, health routing, and missing-bearer-token rejection.
- If runtime validation reveals a backend defect, add or update a focused Go test that would catch the regression.
- Playwright E2E tests are not required for this slice; Milestone 4 owns browser E2E coverage.

## Responsive and Accessibility Checks

- Not applicable. This slice validates backend runtime behavior and has no UI surface.

## Closure Criteria

- PostgreSQL validation database is available.
- Migrations apply successfully.
- API starts against PostgreSQL.
- Backend tests pass.
- Makefile database lifecycle commands work and clean up orphans.
- HTTP smoke checks pass for health, auth, protected-route rejection, CRUD, tag assignment, and ownership boundaries.
- `specs/2026-06-29-backend-api-auth/validation.md` is updated with actual results.
- README or developer notes document the backend test and database lifecycle commands.
- `specs/roadmap.md` is updated only for milestones whose closure criteria are fully validated.
