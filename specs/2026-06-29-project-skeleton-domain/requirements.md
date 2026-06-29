# Project Skeleton and Domain Requirements

## Functional Requirements

- The repository must include a `backend` directory with a Go module.
- The backend must define domain models for:
  - `User`
  - `TodoList`
  - `Task`
  - `Tag`
- Domain models must express these relationships:
  - A user owns many todo lists.
  - A todo list contains many tasks.
  - A task can have many tags.
  - A tag can be assigned to many tasks.
- The backend must include versioned SQL migrations under `backend/migrations`.
- The initial migration must create these tables:
  - `users`
  - `todo_lists`
  - `tasks`
  - `tags`
  - `task_tags`
- The repository must include top-level `web`, `mobile`, and `deploy` directories aligned with the planned stack.

## Non-Functional Requirements

- The backend must compile with Go 1.22 or newer.
- The schema must use PostgreSQL-compatible SQL.
- The scaffold must remain small and inspectable.
- Binary or assignment-reference files must not be modified.

## Content and Data Requirements

- User records must include email, password hash, and timestamps.
- Todo lists must include owner, title, optional description, and timestamps.
- Tasks must include list, title, optional description, status, optional due date, and timestamps.
- Tags must include owner, name, optional color, and timestamps.
- Task-tag assignments must be represented with a join table.

## Acceptance Criteria

- `backend/go.mod` exists and declares a backend module.
- `backend/cmd/api/main.go` compiles.
- Domain entities exist in the backend domain package.
- `backend/migrations/000001_create_core_schema.up.sql` creates the core schema.
- `backend/migrations/000001_create_core_schema.down.sql` drops the core schema in dependency-safe order.
- `go test ./...` passes from the backend directory.
- Scaffold directories exist for the planned web, mobile, and deploy surfaces.
