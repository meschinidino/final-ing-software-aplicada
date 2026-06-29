# Roadmap

## Milestone 1: Project Skeleton and Domain

Establish the repository structure and the core TodoList domain.

Deliverables:

- Backend directory with Go module setup.
- Web directory with React + Vite + TypeScript setup.
- Mobile directory with Ionic React setup.
- Deploy directory for Docker, Loki, Alloy, and Grafana configuration.
- Domain entities:
  - `User`
  - `TodoList`
  - `Task`
  - `Tag`
- Database relationship design:
  - `User` has many `TodoList`.
  - `TodoList` has many `Task`.
  - `Task` has many `Tag`.
  - `Tag` has many `Task`.
- Initial versioned migrations for PostgreSQL.

Exit criteria:

- The backend compiles.
- Migrations create the database schema from scratch.
- The repo structure matches the implementation plan in `tech-stack.md`.

## Milestone 2: Backend API and Authentication

Implement the REST API required for the project.

Deliverables:

- Go API using Gin.
- PostgreSQL persistence using GORM.
- Versioned migrations using golang-migrate.
- JWT authentication using golang-jwt.
- `POST /api/authenticate` endpoint.
- Protected CRUD endpoints for:
  - Todo lists.
  - Tasks.
  - Tags.
- Ownership checks so authenticated users only access their own todo data.
- Health endpoint for local verification and containers.

Exit criteria:

- Authenticated API requests work with a valid JWT.
- Protected endpoints return `401` without a valid token.
- CRUD behavior can be verified with HTTP requests.

## Milestone 3: Backend Unit Tests

Add focused backend test coverage.

Deliverables:

- At least two Go unit tests.
- At least one unit test for non-trivial logic, such as JWT generation/validation, request validation, or domain mapping.
- Test commands documented in the project README or developer notes.

Exit criteria:

- `go test ./...` passes locally.
- The same command is ready to run in CI.

## Milestone 4: Web App and E2E Coverage

Build the minimal React web app and prove it through Playwright.

Deliverables:

- Login screen that stores the JWT.
- Todo list/task screen that consumes the API.
- UI flow to create and delete at least one entity.
- Playwright setup under the web project.
- Three E2E tests:
  - Login through the UI and verify session state.
  - Login through API using `APIRequestContext`, persist `storageState`, and perform an authenticated action.
  - CRUD flow through the UI: create, see in list, delete.

Exit criteria:

- `npx playwright test` passes headlessly.
- E2E tests exercise both authentication paths required by the assignment.

## Milestone 5: Dockerized Runtime

Containerize the application and make the full local stack reproducible.

Deliverables:

- Multi-stage Dockerfile for the Go API.
- Dockerfile or build configuration for the web app.
- Docker Compose stack with:
  - `api`
  - `db`
  - `web`
  - `loki`
  - `alloy`
  - `grafana`
- Environment variable templates for local execution.
- Startup order and health checks where useful.

Exit criteria:

- `docker compose up` starts the app, database, web UI, and observability services.
- The web app can authenticate against the API running in containers.

## Milestone 6: Observability with Loki and Grafana

Add centralized container log ingestion.

Deliverables:

- Loki configuration.
- Grafana Alloy configuration using Docker log discovery.
- Grafana datasource provisioning for Loki.
- API logs with enough structure to identify requests and errors.
- Example LogQL query documented for evaluator verification.

Exit criteria:

- Grafana is available locally.
- Loki is configured as a Grafana datasource.
- API container logs can be queried in Grafana Explore.

## Milestone 7: Ionic PWA and Offline Behavior

Implement the mobile-oriented PWA experience.

Deliverables:

- Ionic React app consuming the same API.
- Login with JWT persistence.
- View that lists todo data from the API.
- `vite-plugin-pwa` configuration.
- Web app manifest and service worker.
- Offline app shell.
- Cached display of the last loaded todo data.

Exit criteria:

- The app is installable as a PWA.
- With network disabled, the app still loads and shows cached data from the last session.

## Milestone 8: CI and Delivery Evidence

Create the GitHub Actions pipeline required for final delivery.

Deliverables:

- `.github/workflows/ci.yml`.
- Test job running `go test ./...`.
- GitHub Container Registry login using the repository `GITHUB_TOKEN`.
- Docker build/push job for the API image.
- Tags:
  - `ghcr.io/<github-owner>/<app>:latest`
  - `ghcr.io/<github-owner>/<app>:<commit-sha>`

Exit criteria:

- Workflow runs on push and pull request to `main`.
- Tests run before Docker image publication.
- API image is published to GitHub Container Registry.

## Milestone 9: Final Verification Package

Prepare the project for evaluation.

Deliverables:

- README with setup, test, Docker, logs, PWA, and CI instructions.
- Requirement checklist mapped to implemented files and commands.
- Screenshots or short notes for:
  - Web login and CRUD.
  - Playwright tests.
  - Grafana LogQL query.
  - PWA offline behavior.
  - GitHub Container Registry image.

Exit criteria:

- A reviewer can follow the README and verify every requirement without guessing.
