# Dockerized Runtime Requirements

## Functional Requirements

- The repository must include a Docker image definition for the Go API.
- The API container must connect to the PostgreSQL container using Compose networking.
- The API container must expose the existing HTTP API and health endpoint.
- The repository must include a Docker image definition for the React web app.
- The web container must serve the built React app.
- The browser-loaded web app must authenticate against the API running in Docker.
- The Compose stack must include these services:
  - `api`
  - `db`
  - `web`
  - `loki`
  - `alloy`
  - `grafana`
- The database service must use PostgreSQL 16.
- Runtime credentials and ports must be documented for local evaluation.
- The existing backend validation database commands must remain usable or be replaced by equivalent documented commands.
- The full runtime stack and backend validation stack must use separate Compose project names, host ports, and named volumes.
- Resetting or stopping one stack must not remove containers, networks, or volumes that belong to the other stack.
- The Makefile must expose Docker runtime commands for starting, stopping, and inspecting the full runtime stack.

## Non-Functional Requirements

- Dockerfiles should be small, deterministic, and suitable for local evaluation.
- The API Dockerfile must use a multi-stage build.
- The final API image should not include the full Go toolchain.
- Compose startup should avoid avoidable race conditions by using health checks or service dependencies.
- Development secrets must be local-only and must not be presented as production secrets.
- The stack must stay simple enough for an evaluator to inspect quickly.

## Configuration Requirements

- The API must support these environment variables in Docker:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `APP_ENV`
  - `API_ADDR`
- The web build/runtime must expose or embed an API base URL that works from the browser.
- The database service must provide a persistent named volume.
- The runtime database volume must be distinct from the validation database volume.
- Grafana should be reachable on a documented local port.
- Loki and Alloy should use configuration files under `deploy/`.

## Documentation Requirements

- README or developer notes must include:
  - Makefile command to start the Dockerized runtime.
  - Makefile command to stop and clean up the runtime.
  - Makefile command to inspect runtime service status.
  - The Compose project name, ports, and volumes used by the runtime.
  - The command that verifies the validation database workflow still works.
  - Web app URL.
  - API health URL.
  - Grafana URL.
  - Any required migration step if migrations are not automatic.

## Acceptance Criteria

- `docker compose` from the deployment configuration starts all runtime services.
- `docker compose ps` reports the core runtime services as running or healthy.
- The API health endpoint responds from the host.
- The web app loads from the host.
- A user can authenticate through the web app against the containerized API.
- The database persists data across a normal container restart.
- The validation database workflow used by backend tests is not regressed.
- Running validation reset commands does not delete full-runtime data, and stopping the full runtime does not stop the validation database.
