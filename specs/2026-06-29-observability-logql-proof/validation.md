# Observability LogQL Proof Validation

## Manual Validation

- Start the full runtime stack:

```sh
make runtime-up
```

- Confirm Docker reports the observability services as running:
  - `loki`
  - `alloy`
  - `grafana`

- Generate API traffic from the host:

```sh
curl http://localhost:8080/health
```

- Open Grafana:

```text
http://localhost:3000
```

- Sign in with the documented local credentials.
- Open Explore and select the provisioned Loki datasource.
- Run the documented LogQL query for API logs.
- Confirm at least one API log line from the runtime API container is visible.
- Open the provisioned observability dashboard.
- Confirm the dashboard shows API log volume and recent API log lines after traffic is generated.

## Technical Checks

- Run backend tests:

```sh
make backend-test
```

- Start the runtime stack:

```sh
make runtime-up
```

- Inspect service state:

```sh
make runtime-status
```

- Confirm the API health endpoint responds:

```sh
curl http://localhost:8080/health
```

- Confirm the web app responds:

```sh
curl -I http://localhost:5173
```

- Confirm Grafana responds:

```sh
curl -I http://localhost:3000/login
```

- Confirm dashboard provisioning files are mounted and Grafana starts without provisioning errors:

```sh
docker compose -p todolist-runtime -f deploy/docker-compose.yml logs grafana
```

- Check Alloy logs for configuration or forwarding errors:

```sh
docker compose -p todolist-runtime -f deploy/docker-compose.yml logs alloy
```

- Check Loki logs for ingestion errors:

```sh
docker compose -p todolist-runtime -f deploy/docker-compose.yml logs loki
```

- Stop the runtime stack:

```sh
make runtime-down
```

## Expected Unit And E2E Tests

- No new frontend E2E tests are required for this milestone because the behavior under test is infrastructure log ingestion.
- No new Playwright tests are required for the Grafana dashboard because it is infrastructure tooling, not product UI.
- Existing backend unit tests must continue to pass.
- If API logging middleware is changed, add or update a focused backend test only when response behavior or middleware ordering changes in a testable way.

## Responsive And Accessibility Checks

- No responsive UI changes are planned.
- No accessibility checks are required unless Grafana documentation is replaced by a custom project UI, which is out of scope for this milestone.

## Closure Criteria

- Alloy actively collects Docker runtime logs and forwards them to Loki.
- Grafana has a working provisioned Loki datasource.
- Grafana has a provisioned observability dashboard.
- The documented LogQL query returns API logs after a request is made.
- The provisioned dashboard shows API log data after traffic is generated.
- README or developer notes include the observability verification steps.
- Existing backend tests pass.
- Runtime start, status, and shutdown commands still work.
- `specs/roadmap.md` is updated to mark Milestone 6 complete only after implementation and validation pass.

## Validation Result

Implemented and validated on 2026-06-29.

- `make backend-test` passed.
- `make runtime-up` started the stack and reported API, web, Loki, Alloy, Grafana, database, and migration services healthy or completed.
- `curl http://localhost:8080/health` returned API health successfully.
- `curl -I http://localhost:5173` returned the web runtime successfully.
- `curl -I http://localhost:3000/login` returned the Grafana login page successfully.
- Fresh Grafana startup logs showed Loki datasource provisioning and dashboard provisioning completed.
- Grafana 12.1.0 emitted internal `table` plugin registration messages at `level=error`; Grafana still served `200 OK`, and datasource/dashboard provisioning completed successfully.
- Fresh Alloy startup logs showed the corrected configuration loaded without configuration errors.
- Loki labels included `compose_project="todolist-runtime"` and `compose_service="api"`.
- The LogQL query `{compose_project="todolist-runtime", compose_service="api"}` returned API logs after health traffic.
- `make runtime-down` stopped the runtime stack.
