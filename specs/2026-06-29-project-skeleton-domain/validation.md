# Project Skeleton and Domain Validation

Status: Passed on 2026-06-29 with `GOCACHE=/Users/dinomeschini/Documents/final_ing_soft_aplicada/.gocache go test ./...` from `backend`.

## Manual Validation

- Confirm the repository contains `backend`, `web`, `mobile`, and `deploy`.
- Confirm backend source follows the planned shape in `specs/tech-stack.md`.
- Review the migration SQL to ensure it creates all core tables and relationships.
- Confirm `trabajo-final-specs.md` remains untracked reference material and is not modified.

## Technical Checks

Run from `backend`:

```sh
go test ./...
```

Optional migration smoke check once a PostgreSQL container or local database is available:

```sh
migrate -path backend/migrations -database "$DATABASE_URL" up
migrate -path backend/migrations -database "$DATABASE_URL" down
```

## Expected Unit and E2E Tests

- No dedicated unit tests are required for this skeleton milestone.
- Backend test coverage starts in Milestone 3.
- Playwright E2E coverage starts in Milestone 4.

## Responsive and Accessibility Checks

- Not applicable for this milestone because no user-facing workflow is implemented yet.

## Closure Criteria

- Backend compilation passes.
- The initial database schema is represented as versioned migrations.
- The roadmap Milestone 1 exit criteria are satisfied.
