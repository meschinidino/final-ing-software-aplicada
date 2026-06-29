# Backend API and Authentication Plan

Status: Implemented and validated on 2026-06-29.

## Objective

Implement the TodoList backend API required by Milestone 2, including user registration, JWT authentication, PostgreSQL persistence through GORM, protected CRUD endpoints, ownership checks, and a health endpoint.

## Scope

- Add Gin as the HTTP router for the backend API.
- Add GORM-based PostgreSQL persistence using the existing schema in `backend/migrations`.
- Add runtime configuration for database connection, JWT secret, server address, and optional seeded evaluator credentials.
- Add `POST /api/register` for account creation.
- Add `POST /api/authenticate` for login and JWT issuance.
- Add JWT middleware for protected routes.
- Add CRUD endpoints for:
  - Todo lists.
  - Tasks.
  - Tags.
- Add task-tag assignment support through task create/update payloads or `PUT /api/tasks/:id/tags`, choosing the simpler implementation during build.
- Enforce ownership so users can only access their own todo lists, tasks, and tags.
- Add `GET /health` for local, test, and container verification.

## Out of Scope

- Backend unit tests beyond any small tests needed to support implementation confidence; Milestone 3 owns the formal unit-test requirement.
- React web UI, Playwright tests, and frontend API integration.
- Docker image, Docker Compose runtime, and observability service wiring.
- PWA/offline behavior.
- Password reset, email verification, roles, refresh tokens, and production-grade account management.

## Proposed Architecture

The backend should grow from the existing skeleton into the planned structure from `specs/tech-stack.md`:

```text
backend/
├── cmd/api/main.go
├── internal/
│   ├── auth/
│   ├── config/
│   ├── domain/
│   ├── handlers/
│   ├── middleware/
│   ├── repositories/
│   └── services/
├── migrations/
├── go.mod
└── go.sum
```

The API entry point should load configuration, connect to PostgreSQL, run no implicit destructive database work, construct repositories/services/handlers, and start the Gin server.

GORM models can reuse the existing `domain` structs if tags can be added cleanly. If persistence-specific annotations make the domain noisy, introduce repository model mapping only where it keeps the code simpler.

JWT handling belongs in `internal/auth`. Password hashing should use bcrypt. Request validation should stay close to handlers unless repeated validation logic becomes clearer as service code.

## Implementation Steps

1. Add backend dependencies: Gin, GORM PostgreSQL driver, golang-jwt, bcrypt, and any small configuration helper if needed.
2. Add configuration loading with conservative defaults for local development.
3. Add database connection setup using GORM and the existing PostgreSQL schema.
4. Add auth service behavior:
   - Register a user with unique email and hashed password.
   - Authenticate email/password and issue a signed JWT.
   - Parse and validate JWT claims for protected requests.
5. Add middleware that rejects missing or invalid bearer tokens with `401`.
6. Add handlers and repositories for todo lists, tasks, and tags.
7. Add ownership checks:
   - Todo lists are scoped by `user_id`.
   - Tasks are accessible only through todo lists owned by the current user.
   - Tags are scoped by `user_id`.
   - Task-tag assignments cannot attach another user's tag to a task.
8. Add `GET /health` returning a small JSON status response.
9. Optionally add a seeded evaluator user path if it can be done without complicating the runtime; otherwise rely on `POST /api/register`.
10. Update README or developer notes only if needed to document the new local API commands.

## Risks and Decisions

- `POST /api/register` was selected by the user for Milestone 2, even though the roadmap only requires `POST /api/authenticate`.
- The existing SQL migrations are the source of truth. Avoid GORM auto-migration unless used only for tests.
- Task-tag assignment should be implemented in the smallest usable way. Payload-based assignment may be simpler than a separate route, but the implementation should keep the API easy to verify with HTTP requests.
- JWT secret defaults are acceptable for local development, but production-like runs must be configurable through environment variables.
- Because frontend work starts later, HTTP examples or curl-based checks should be enough to validate this milestone.

## Expected Result

Milestone 2 is ready for implementation when this spec is approved. It is complete only after authenticated API requests work with valid JWTs, protected endpoints reject unauthenticated requests, CRUD operations persist in PostgreSQL, and ownership checks prevent cross-user access.
