# Dockerized Runtime Validation

## Manual Validation

- Start the runtime stack with the documented Makefile command.
- Confirm Docker reports these services as running:
  - `api`
  - `db`
  - `web`
  - `loki`
  - `alloy`
  - `grafana`
- Open the web app in a browser.
- Log in with a seeded or registered user.
- Create a todo list or task through the web app.
- Refresh the page and confirm the created data is still visible.
- Restart the database container or the full runtime stack using the documented Makefile or Compose command.
- Reopen the web app and confirm the previously created todo list or task is still visible.
- Open the API health URL and confirm it returns a successful response.
- Open Grafana and confirm the service is reachable.

## Technical Checks

- Run backend tests:

```sh
make backend-test
```

- Build the API image:

```sh
docker compose -f deploy/docker-compose.yml build api
```

- Build the web image:

```sh
docker compose -f deploy/docker-compose.yml build web
```

- Start the full runtime stack:

```sh
make runtime-up
```

- Inspect service state:

```sh
make runtime-status
```

- Verify runtime data persists across a normal container restart:

```sh
docker compose -f deploy/docker-compose.yml restart db
```

- Re-check the web app or API and confirm the todo list or task created during manual validation still exists.

- Verify the backend validation database workflow still works:

```sh
make db-reset
make migrate-up
make backend-test
make validation-down
```

- Confirm validation workflow isolation:

```sh
docker compose -p todolist-validation -f deploy/docker-compose.yml ps
docker compose -f deploy/docker-compose.yml ps
```

- The validation project must not own or stop the full-runtime containers, networks, or volumes. The full-runtime project must not own or stop validation resources.

- Stop the runtime stack:

```sh
make runtime-down
```

## E2E Checks

- If the web Playwright tests can target the Dockerized runtime without code changes, run:

```sh
cd web
npx playwright test
```

- If the existing Playwright config still assumes local non-container ports, record the gap and either add a Docker runtime test command or keep Playwright validation under the existing web milestone.

## Observability Checks

- Confirm Loki, Alloy, and Grafana containers start.
- Confirm Grafana is reachable from the host.
- Do not require final LogQL evidence in this milestone; that proof belongs to Milestone 6.

## Closure Criteria

- All required Docker runtime files are implemented.
- The runtime stack starts from a clean checkout with documented Makefile commands.
- Makefile targets exist for starting, stopping, and inspecting the full runtime stack.
- The web app can authenticate against the API in containers.
- Data created through the web app survives at least one normal database or full-stack restart.
- Backend tests still pass.
- `make db-reset`, `make migrate-up`, and `make backend-test` still pass, or an equivalent replacement workflow is documented and verified.
- Runtime and validation Compose resources are isolated by project name, ports, and volumes.
- Any skipped validation command is documented with the exact reason.
- `specs/roadmap.md` is updated to mark Milestone 5 complete only after implementation and validation pass.

## Validation Result

Validated on 2026-06-29:

- `make backend-test` passed.
- `make runtime-up` built `todolist-api:local` and `todolist-web:local`, then started all runtime services.
- `make runtime-status` reported `api`, `db`, and `web` healthy, with Loki, Alloy, and Grafana running.
- `curl http://localhost:8080/health` returned `{"status":"ok"}` from the Dockerized API.
- `curl -I http://localhost:5173` returned `200 OK` from the Dockerized web app.
- `curl -I http://localhost:3000/login` returned `200 OK` from Grafana.
- API smoke validation registered a user, authenticated, created a todo list, and listed it back through the Dockerized API.
- Restarting the runtime database preserved todo list rows in `todolist-runtime_todolist_runtime_db`.
- `make db-reset && make migrate-up && make backend-test && make validation-down` passed against the separate validation project.

No validation checks were skipped.
