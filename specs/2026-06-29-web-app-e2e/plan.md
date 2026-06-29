# Web App and E2E Coverage Plan

## Objective

Implement the minimal React web application required by Milestone 4 and prove it with Playwright end-to-end tests.

The web app should let an evaluator authenticate, view todo data, create a todo list, create tasks in that list, and delete created data through the existing backend API.

## Scope

- Replace the current web skeleton with a small React + TypeScript todo workflow.
- Add API client code for:
  - `POST /api/register`
  - `POST /api/authenticate`
  - protected todo list CRUD needed by the UI
  - protected task CRUD needed by the UI
- Persist the JWT in browser storage after login.
- Show an authenticated application screen after login.
- Support creating and deleting at least one todo list through the UI.
- Support creating and deleting at least one task in the selected todo list through the UI.
- Add Playwright tests for the three Milestone 4 authentication and CRUD paths.
- Keep test users self-contained by registering unique users during Playwright setup or test execution.

## Out Of Scope

- Full tag management UI.
- Task-tag assignment UI.
- Advanced task filtering, due-date editing, reminders, collaboration, or notifications.
- PWA/offline behavior, which belongs to Milestone 7.
- Dockerized web runtime, which belongs to Milestone 5.
- Visual design beyond a clean, usable evaluation interface.

## Proposed Architecture

- Keep the web app as a single Vite React application under `web/`.
- Use plain React state and small helper functions instead of adding routing or state-management libraries.
- Introduce a typed API helper module under `web/src/` for request handling and JWT authorization headers.
- Use an environment variable for the API base URL:
  - `VITE_API_URL`, defaulting to `http://localhost:8080`.
- Store the JWT in `localStorage` under a stable key for normal login.
- Keep Playwright storage-state output under a generated path that is ignored by git if needed.
- Use test-time registration with unique email addresses so E2E tests do not depend on pre-seeded users.

## Implementation Steps

1. Update the web app UI with:
   - login form
   - authenticated todo screen
   - todo list creation and deletion
   - task creation and deletion for a selected list
   - simple loading and error states
2. Add typed API helper functions for authentication, todo lists, and tasks.
3. Add Playwright test helpers for generating unique users, registering through the API, authenticating through the API, and seeding browser storage state.
4. Add Playwright test 1:
   - register a unique user through the API
   - login through the UI
   - verify JWT-backed session state and authenticated content
5. Add Playwright test 2:
   - register and authenticate through Playwright `APIRequestContext`
   - persist `storageState`
   - open the app already authenticated
   - perform an authenticated todo-list action
6. Add Playwright test 3:
   - login through the UI
   - create a todo list
   - create a task in that list
   - verify both appear
   - delete the task and todo list
   - verify they disappear
7. Update web scripts or Playwright config only if needed to run tests consistently against the local Vite app.
8. After implementation and validation pass, update `specs/roadmap.md` to mark Milestone 4 complete.

## Risks And Decisions

- Playwright tests require the backend API and PostgreSQL validation database to be running. This plan will rely on existing Makefile targets rather than adding Docker scope to this milestone.
- Test-time registration avoids seeded-data coupling, but tests must use unique email addresses to prevent conflicts across repeated runs.
- The UI will intentionally expose only the minimal workflow needed for evaluation; tag UI remains deferred.
- If the current backend CORS behavior blocks browser requests, implementation may need a narrow backend CORS addition. That would still belong to this milestone because it enables the web client to consume the API.

## Expected Result

An evaluator can start the validation database and API, run the React web app locally, log in through the browser, create and delete todo data, and run three headless Playwright tests covering the required Milestone 4 flows.
