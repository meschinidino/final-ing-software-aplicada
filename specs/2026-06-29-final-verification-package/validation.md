# Final Verification Package Validation

## Manual Validation

- Open `README.md` and confirm it has a clear final evaluation section.
- Open `docs/evaluation/final-checklist.md` and confirm each mission success criterion is represented.
- Open `docs/evaluation/evidence.md` and confirm local, manual, and remote checks are separated.
- Confirm `docs/evaluation/evidence.md` includes short notes or placeholders for web login and CRUD, Playwright, Grafana LogQL, PWA offline, and GHCR evidence.
- Confirm no screenshots, generated reports, `dist/`, `node_modules/`, logs, secrets, or local runtime files were added.
- Confirm `trabajo-final-specs.md` remains uncommitted unless explicitly requested by the user.
- Confirm binary presentation files, if present, were not modified.

## Technical Checks

Run backend unit tests:

```sh
make backend-test
```

Run Playwright E2E tests:

```sh
cd web
npx playwright test
```

Build the mobile/PWA app:

```sh
cd mobile
npm run build
```

Start and inspect the Docker runtime:

```sh
make runtime-up
make runtime-status
```

After runtime validation, stop the stack:

```sh
make runtime-down
```

If Docker, Playwright browsers, or other local prerequisites are unavailable, record the exact failure in `docs/evaluation/evidence.md`.

## Observability Checks

- Start the runtime with `make runtime-up`.
- Generate API traffic:

```sh
curl http://localhost:8080/health
```

- Open Grafana at `http://localhost:3000`.
- Confirm Loki is provisioned as a datasource.
- Run this LogQL query:

```logql
{compose_project="todolist-runtime", compose_service="api"}
```

- Confirm API logs appear, including the health request or other recent API traffic.

## Web UI Checks

- Start the API and web app through either the validation commands or Docker runtime.
- Register or log in through the web interface.
- Create todo data through the UI.
- Confirm the created data appears in the UI.
- Delete the created data and confirm it is removed from the UI.
- Record the result as a short text note in `docs/evaluation/evidence.md`.

## PWA Checks

- Build and preview the mobile app in production mode.
- Confirm the manifest is available at `/manifest.webmanifest`.
- Confirm a service worker is registered.
- Log in and load todo data while online.
- Disable network or stop the API.
- Reload the PWA and confirm the app shell loads and the last loaded todo data is displayed from the offline cache.

## CI and GHCR Checks

- Open the GitHub Actions tab after pushing to `main`.
- Confirm the CI workflow runs on push and pull request events targeting `main`.
- Confirm backend tests pass before image publication.
- Confirm pull request runs do not publish an image.
- Confirm the GHCR package exists at:

```text
ghcr.io/<github-owner>/todolist-api
```

- Confirm both tags exist:
  - `latest`
  - the commit SHA for the successful workflow run.

## Closure Criteria

- All feasible local checks have passed or have documented blocked reasons.
- Manual checks have clear instructions and expected results.
- Remote checks are verified or explicitly marked pending remote validation.
- The roadmap is updated to mark Milestone 9 implemented only after the final package is complete.
- The final response to the user lists the generated docs and the validation status.
