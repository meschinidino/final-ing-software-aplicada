# Observability LogQL Proof Requirements

## Functional Requirements

- The runtime Compose stack must continue to include:
  - `api`
  - `db`
  - `web`
  - `loki`
  - `alloy`
  - `grafana`
- Grafana Alloy must collect container logs from the Dockerized runtime.
- Alloy must forward collected logs to Loki.
- Loki must accept and store logs from Alloy.
- Grafana must provision Loki as a datasource automatically.
- Grafana must provision one dashboard automatically from repository files.
- API container logs must be queryable from Grafana Explore.
- The provisioned dashboard must show API logs or API log volume from Loki.
- The documented LogQL query must return API logs after at least one API request is made.
- The API must emit request or error logs with enough information to identify API traffic during validation.
- Observability changes must not break existing web, API, database, or validation workflows.

## Non-Functional Requirements

- Keep the logging stack simple and inspectable for an evaluator.
- Prefer local Docker Compose configuration over extra scripts or external services.
- Avoid adding unrelated dependencies to the backend or frontend.
- Do not introduce production security claims for the local observability setup.
- Keep the dashboard small and evaluator-focused.
- Keep documentation concise and command-oriented.

## Configuration Requirements

- `deploy/alloy/config.alloy` must contain the active log collection and Loki forwarding pipeline.
- `deploy/docker-compose.yml` must mount only the Docker resources Alloy needs for local log collection.
- Runtime service labels exposed to Loki must support a stable API query.
- `deploy/grafana/provisioning/datasources/loki.yml` must point Grafana to the Loki service reachable inside Compose.
- Grafana dashboard provisioning must live under `deploy/grafana/provisioning/dashboards/`.
- Dashboard JSON must live under `deploy/grafana/dashboards/` or another clearly documented path under `deploy/grafana/`.
- The documented Grafana URL must remain `http://localhost:3000` unless implementation discovers a port conflict and changes it intentionally.
- The documented Loki URL must remain `http://localhost:3100` unless implementation discovers a port conflict and changes it intentionally.

## Documentation Requirements

- README or equivalent developer notes must include:
  - The command to start the runtime stack.
  - The command or request used to generate API logs.
  - Grafana URL and local credentials.
  - The exact Loki datasource name.
  - The exact LogQL query that was validated.
  - The provisioned dashboard name and where to find it in Grafana.
  - The expected result an evaluator should see.
- Documentation must clearly state that Grafana credentials and Docker socket access are for local evaluation only.

## Acceptance Criteria

- `make runtime-up` starts the runtime stack with Loki, Alloy, and Grafana running.
- Alloy starts without configuration errors.
- Loki receives log entries from Alloy.
- Grafana opens locally and has a working Loki datasource.
- Grafana opens locally and has the observability dashboard provisioned.
- A request to the API health endpoint or authenticated API route produces a log entry.
- The documented LogQL query returns API logs in Grafana Explore.
- The dashboard shows API log data after API traffic is generated.
- Existing backend tests still pass.
- The web app still loads from the Dockerized runtime.
- Runtime shutdown still works with `make runtime-down`.
- Milestone 6 is marked complete in `specs/roadmap.md` only after the above criteria are validated.
