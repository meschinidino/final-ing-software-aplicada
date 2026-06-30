# Observability LogQL Proof Plan

## Objective

Implement Milestone 6 by turning the existing Loki, Grafana Alloy, and Grafana containers into a verifiable centralized logging setup. The target result is that an evaluator can start the Dockerized runtime, generate API traffic, open Grafana Explore, and query API container logs through Loki with a documented LogQL query.

## Planning Assumption

The structured question tool was invoked to confirm observability scope. The selected scope is LogQL proof, with a small dashboard included:

- Implement Docker container log ingestion through Grafana Alloy.
- Keep Grafana datasource provisioning simple and automatic.
- Add or preserve API logs that are useful for request/error verification.
- Document an evaluator-friendly LogQL query and validation flow.
- Add one simple provisioned Grafana dashboard that visualizes API log volume and shows recent API log lines.

## Scope

- Replace the placeholder Alloy configuration with Docker log discovery and Loki forwarding.
- Mount the Docker socket or required Docker log paths into the Alloy service using the existing Compose runtime.
- Add stable labels that make API logs easy to query in Loki.
- Ensure Grafana provisions Loki as the default datasource.
- Provision one simple Grafana dashboard from repository files.
- Ensure the API emits enough request and error information for observability validation.
- Document the exact runtime command, traffic-generation command, Grafana URL, and LogQL query in README or developer notes.
- Update the Milestone 6 validation result only after implementation and checks pass.
- Update `specs/roadmap.md` only after implementation and validation pass.

## Out Of Scope

- Alerts, notification channels, or saved Explore views.
- Complex dashboard design beyond one evaluator-focused API logs dashboard.
- Metrics or traces.
- Production-grade log retention, authentication, TLS, or multi-environment observability.
- Changing product workflows, API behavior, authentication behavior, or database schema.
- PWA/offline behavior.
- GitHub Actions and container registry publishing.

## Proposed Architecture

The existing `deploy/docker-compose.yml` remains the single local runtime entry point. The runtime already starts `api`, `db`, `web`, `loki`, `alloy`, and `grafana`.

For this milestone:

- `api` writes request and error logs to stdout/stderr.
- Docker captures container stdout/stderr.
- `alloy` discovers Docker containers, reads their logs, attaches useful labels, and pushes entries to `http://loki:3100/loki/api/v1/push`.
- `loki` stores logs using the existing filesystem-backed local configuration.
- `grafana` provisions Loki as the default datasource from `deploy/grafana/provisioning/datasources/loki.yml`.
- `grafana` provisions a small dashboard from `deploy/grafana/provisioning/dashboards/` and `deploy/grafana/dashboards/`.

The preferred API log query should be easy for a reviewer to adapt, for example:

```logql
{compose_service="api"}
```

If Alloy's Docker discovery produces different label names with the selected component, the implementation should document the exact final query that works locally.

## Implementation Steps

1. Inspect the current Docker Compose, Alloy, Loki, Grafana, and API logging behavior.
2. Update `deploy/alloy/config.alloy` to discover Docker containers and forward container logs to Loki.
3. Update the `alloy` service in `deploy/docker-compose.yml` with the minimal mounts and permissions needed for Docker log discovery.
4. Add labels or relabeling rules so runtime services can be queried predictably by service name, especially the API.
5. Review API request logging from Gin and existing error logging; adjust only if logs are not useful enough for the evaluator query.
6. Keep Grafana datasource provisioning simple and verify the existing Loki datasource file still matches the runtime service name.
7. Add Grafana dashboard provisioning and one dashboard with:
   - API log volume over time.
   - Recent API log lines.
   - A dashboard variable or fixed query that targets the API service logs.
8. Add README instructions for:
   - Starting the runtime.
   - Generating API traffic.
   - Opening Grafana.
   - Running the LogQL query.
   - Opening the provisioned dashboard.
   - Confirming API logs appear.
9. Validate the runtime and record results in `validation.md`.
10. Mark Milestone 6 complete in `specs/roadmap.md` only after validation passes.

## Risks And Decisions

- Alloy Docker log discovery requires access to Docker metadata and container logs. The implementation must keep mounts minimal and document that this is a local evaluation setup, not a production security model.
- Grafana Alloy component syntax is version-sensitive. The implementation should match the current `grafana/alloy:v1.10.2` image in Compose and validate with the container startup logs.
- Label names may vary depending on whether Alloy uses Docker discovery, Docker log source components, or file tailing. The final README must use the actual verified label names, not an assumed query.
- Gin's default logger may already be enough for request logs. If adding custom middleware, keep it narrow and avoid changing response behavior.
- The runtime stack currently uses local development credentials. Observability documentation should present them as local-only evaluator credentials.
- Grafana dashboard JSON can become noisy if overbuilt. Keep the dashboard focused on evaluator proof rather than broad operational monitoring.

## Expected Result

After implementation, a reviewer can run the Dockerized runtime, trigger an API request, open Grafana at the documented local URL, select the provisioned Loki datasource, run the documented LogQL query, and see API container logs returned from Loki. The reviewer can also open the provisioned dashboard and see API log volume plus recent API log lines.
