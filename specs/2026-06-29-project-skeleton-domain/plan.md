# Project Skeleton and Domain Plan

Status: Implemented and validated on 2026-06-29.

## Objective

Establish the initial repository structure for the TodoList final project and define the core backend domain and database schema needed by later API, test, Docker, web, and PWA milestones.

## Scope

- Create the planned top-level directories: `backend`, `web`, `mobile`, and `deploy`.
- Initialize a minimal Go backend module that compiles.
- Add domain entities for `User`, `TodoList`, `Task`, and `Tag`.
- Add initial PostgreSQL migrations for users, todo lists, tasks, tags, and task-tag relationships.
- Add minimal scaffold files for React web, Ionic React mobile, and deployment configuration directories.
- Keep frontend and deployment files intentionally light because later milestones own their full implementation.

## Out of Scope

- REST API handlers and authentication behavior.
- Database connection setup and GORM persistence.
- Playwright tests.
- Docker images and runnable Docker Compose services.
- Loki, Alloy, and Grafana runtime configuration beyond directory placeholders.
- Full React or Ionic user workflows.

## Proposed Architecture

The backend follows the structure defined in `specs/tech-stack.md`:

```text
backend/
├── cmd/api/main.go
├── internal/domain/
├── migrations/
└── go.mod
```

The domain package contains simple struct definitions that model the project data relationships. SQL migrations provide the durable PostgreSQL schema and are append-only once committed.

The web, mobile, and deploy directories are scaffolded to make the repository shape explicit without preempting later roadmap milestones.

## Implementation Steps

1. Create the feature spec files.
2. Initialize the backend Go module and minimal API entry point.
3. Add domain structs for users, todo lists, tasks, and tags.
4. Add the first up/down SQL migration pair.
5. Add lightweight web and mobile package scaffolds.
6. Add deployment directory placeholders for Docker Compose, Alloy, Loki, and Grafana provisioning.
7. Verify the backend compiles with `go test ./...`.

## Risks and Decisions

- The first milestone should avoid pulling in Gin, GORM, JWT, or frontend dependencies until later milestones need them.
- The SQL schema should be concrete enough for future CRUD work while staying simple and easy to inspect.
- Frontend scaffolds should not introduce generated dependency trees or lockfiles unless the project is actually installed later.

## Expected Result

Milestone 1 is complete when the repository structure matches the planned stack, the backend compiles, and the initial migrations can create the core TodoList schema from scratch.
