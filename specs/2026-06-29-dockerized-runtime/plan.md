# Dockerized Runtime Plan

## Objective

Implement Milestone 5 by making the local TodoList stack reproducible with Docker Compose. The target result is that an evaluator can start PostgreSQL, the Go API, the React web app, and the observability containers from the deployment directory with a single Compose workflow.

## Planning Assumption

The structured question tool was invoked to confirm scope, but it timed out without returning a user selection. This plan uses the recommended scope:

- Containerize the API and web app now.
- Promote the existing placeholder Compose services into a usable full stack.
- Include Loki, Grafana Alloy, and Grafana services in Compose now.
- Leave detailed LogQL proof, log dashboards, and final observability documentation to Milestone 6.

## Scope

- Add a production-oriented multi-stage Dockerfile for the Go API.
- Add a production-oriented Dockerfile for the React web client.
- Update `deploy/docker-compose.yml` so the main stack can run:
  - `api`
  - `db`
  - `web`
  - `loki`
  - `alloy`
  - `grafana`
- Keep the full runtime stack isolated from the existing validation database workflow.
- Add local runtime environment defaults that are safe for development and evaluation.
- Add health checks and service dependencies where they reduce startup guesswork.
- Ensure the web app talks to the containerized API.
- Add or update Makefile commands for the Dockerized runtime.
- Document the runtime command in README or developer notes.

## Out Of Scope

- GitHub Actions and image publishing.
- PWA/offline behavior.
- Grafana dashboards and detailed LogQL validation.
- Production secrets management.
- Kubernetes, cloud deployment, or reverse proxy TLS.
- Product feature changes to todo lists, tasks, tags, or authentication.

## Proposed Architecture

The Compose stack should use `deploy/docker-compose.yml` as the single local runtime entry point.

- `db` runs PostgreSQL 16 with a persistent named volume.
- `api` is built from `backend/`, receives `DATABASE_URL`, `JWT_SECRET`, `APP_ENV`, and `API_ADDR`, exposes port `8080`, and depends on a healthy database.
- `web` is built from `web/`, serves static Vite output through a small web server, exposes port `5173` or another documented local port, and targets the API through a browser-accessible base URL.
- `loki`, `alloy`, and `grafana` start with minimal working configuration so Milestone 6 can focus on proving log ingestion rather than first-time container wiring.

The API image should compile the Go binary in a builder stage and copy only the runtime binary into the final image. The web image should build static assets in Node and serve the resulting `dist/`.

## Implementation Steps

1. Inspect current API configuration, web API base URL handling, and Compose profiles.
2. Add `backend/Dockerfile` with a multi-stage Go build.
3. Add `web/Dockerfile` plus any minimal server config needed to serve the Vite app and route browser traffic to the API.
4. Update `deploy/docker-compose.yml` to build and run the full local stack.
5. Define separate Compose project names, host ports, and named volumes for the full runtime and the existing validation stack so one workflow cannot accidentally stop, reset, or reuse the other's resources.
6. Preserve or replace the existing `validation` profile so `make db-up`, `make db-reset`, and backend validation still work without targeting full-runtime containers or volumes.
7. Add health checks for `db`, `api`, and web where practical.
8. Wire Loki, Alloy, and Grafana with minimal valid configs and persistent Grafana data if useful.
9. Add Makefile targets for the Dockerized runtime, including at minimum `runtime-up`, `runtime-down`, and `runtime-status` or an equivalent inspection target.
10. Update README with the Docker Compose command and expected URLs.
11. Validate the stack and update `specs/roadmap.md` only after the implementation passes.

## Risks And Decisions

- The current `deploy/docker-compose.yml` uses placeholder `future` profiles and is also used by validation commands through the `todolist-validation` Compose project. The implementation must choose explicit isolation boundaries for the full runtime, including project name, ports, and volumes, so `db-reset`, runtime shutdown, and plain Compose cleanup cannot affect the wrong workflow.
- The API currently relies on migrations being applied before startup. The runtime plan should decide whether Compose runs migrations automatically or documents a clear migration command. Prefer explicit and simple unless the existing code already supports automatic migration.
- The web app must call an API URL that works from the user's browser, not only from inside the Docker network.
- Observability containers should be able to start in Milestone 5, but the formal proof that API logs are queryable belongs to Milestone 6.

## Expected Result

After implementation, a reviewer can start the Dockerized runtime, open the web app, authenticate against the API running in containers, and see all required runtime services running through Docker Compose.
