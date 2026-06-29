# Tech Stack

## Architecture

The project will use a small full-stack architecture:

- Backend API in Go.
- PostgreSQL database.
- React web client for browser-based evaluation.
- Ionic React mobile/PWA client for mobile and offline evaluation.
- Docker Compose for local runtime.
- Loki, Grafana Alloy, and Grafana for logs.
- GitHub Actions for CI and GitHub Container Registry image publishing.

The backend is the source of truth. Both the web and mobile apps consume the same REST API.

## Backend

Technology:

- Go 1.22+
- Gin for HTTP routing.
- GORM for database access.
- golang-migrate for versioned migrations.
- golang-jwt for JWT creation and validation.
- PostgreSQL 16 as the database.

Responsibilities:

- Authentication.
- Authorization middleware.
- TodoList, Task, and Tag CRUD.
- Database migrations.
- Backend unit tests.
- Structured or consistent logs for observability.

Suggested structure:

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
└── go.mod
```

## Domain Model

The assignment brief lists `User`, `Blog`, `Post`, and `Tag` as a simple content domain. This project adapts that same relationship shape into a TodoList product:

- `User` replaces the account owner.
- `TodoList` fills the role of a user-owned collection.
- `Task` fills the role of an item inside a collection.
- `Tag` remains the many-to-many classifier.

Relationships:

- `User` 1-N `TodoList`
- `TodoList` 1-N `Task`
- `Task` N-N `Tag`

Core fields:

- `User`: id, email, password hash, created at, updated at.
- `TodoList`: id, user id, title, description, created at, updated at.
- `Task`: id, todo list id, title, description, status, due date, created at, updated at.
- `Tag`: id, user id, name, color, created at, updated at.

## API

Base path:

```text
/api
```

Authentication:

```text
POST /api/authenticate
```

Protected resources:

```text
GET    /api/todo-lists
POST   /api/todo-lists
GET    /api/todo-lists/:id
PUT    /api/todo-lists/:id
DELETE /api/todo-lists/:id

GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/tags
POST   /api/tags
GET    /api/tags/:id
PUT    /api/tags/:id
DELETE /api/tags/:id
```

Task-tag assignment can be implemented as either:

```text
PUT /api/tasks/:id/tags
```

or as part of task create/update payloads, whichever keeps the implementation simpler.

## Web Frontend

Technology:

- React
- Vite
- TypeScript
- Playwright for E2E tests

Responsibilities:

- Login through the API.
- Persist JWT in browser storage.
- Display todo lists and tasks.
- Create and delete at least one entity.
- Provide the flows needed by Playwright tests.

Suggested structure:

```text
web/
├── src/
├── e2e/
├── package.json
├── playwright.config.ts
└── vite.config.ts
```

## Mobile / PWA

Technology:

- Ionic React
- Vite
- TypeScript
- vite-plugin-pwa

Responsibilities:

- Login through the same backend API.
- Persist JWT.
- Display todo data from the API.
- Cache the app shell.
- Cache the last loaded todo data for offline display.
- Provide installable PWA metadata through manifest and service worker.

Suggested structure:

```text
mobile/
├── src/
├── public/
├── package.json
└── vite.config.ts
```

## Database

Technology:

- PostgreSQL 16

Migration strategy:

- Use golang-migrate.
- Store SQL migrations in `backend/migrations`.
- Keep migrations append-only once committed.

Expected tables:

- `users`
- `todo_lists`
- `tasks`
- `tags`
- `task_tags`

## Containers

Technology:

- Docker
- Docker Compose

Required services:

- `api`
- `db`
- `web`
- `loki`
- `alloy`
- `grafana`

Deployment files:

```text
deploy/
├── docker-compose.yml
├── alloy/config.alloy
├── loki/loki-config.yaml
└── grafana/provisioning/datasources/loki.yml
```

The API Dockerfile should be multi-stage and produce a small runtime image using Alpine or distroless.

## Observability

Technology:

- Loki for log storage.
- Grafana Alloy for Docker log collection.
- Grafana for querying and visualization.

Requirements:

- Alloy reads container logs through the Docker socket.
- Alloy pushes logs to Loki.
- Grafana provisions Loki as a datasource.
- API logs can be queried with LogQL, for example by container label.

## Testing

Backend:

```text
go test ./...
```

Minimum backend coverage:

- Two unit tests.
- At least one test over non-trivial logic such as JWT validation, request validation, or domain mapping.

E2E:

```text
npx playwright test
```

Required E2E flows:

- UI login and session verification.
- API login with `APIRequestContext`, persisted `storageState`, and authenticated action.
- UI CRUD flow.

## CI

Technology:

- GitHub Actions
- GitHub Container Registry

Workflow:

- Trigger on push and pull request to `main`.
- Run backend tests.
- Build API Docker image.
- Push API image to GitHub Container Registry after successful tests.

Authentication:

- Use the repository-provided `GITHUB_TOKEN` with package write permissions.

Image tags:

- `latest`
- commit SHA

## Implementation Bias

Keep the implementation boring and verifiable:

- Prefer explicit endpoints over generic abstractions.
- Prefer simple screens over polished but complex UI.
- Prefer direct tests mapped to assignment criteria.
- Prefer clear logs and setup documentation over extra product features.
