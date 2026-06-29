# Web App and E2E Coverage Requirements

## Functional Requirements

- The web app must provide a login form with email and password fields.
- The web app must call `POST /api/authenticate` for visible user login.
- The web app must persist a successful JWT in browser storage.
- The web app must restore an authenticated session from browser storage after reload.
- The web app must let an authenticated user log out by clearing the stored JWT.
- The authenticated screen must list todo lists returned by `GET /api/todo-lists`.
- The authenticated screen must let the user create a todo list through `POST /api/todo-lists`.
- The authenticated screen must let the user delete a todo list through `DELETE /api/todo-lists/:id`.
- The authenticated screen must list tasks returned by `GET /api/tasks`, filtered or grouped clearly by the selected todo list.
- The authenticated screen must let the user create a task through `POST /api/tasks`.
- The authenticated screen must let the user delete a task through `DELETE /api/tasks/:id`.
- API failures must show a clear inline error message.
- The UI must not expose protected data after logout.
- Playwright tests must be able to register unique users through `POST /api/register` so they do not depend on seeded data.

## E2E Requirements

- Test 1 must login through the UI and verify session state.
- Test 2 must authenticate through Playwright `APIRequestContext`, persist `storageState`, and perform an authenticated action through the app.
- Test 3 must execute a CRUD flow through the UI:
  - create data
  - see it in the list
  - delete it
  - verify it is gone
- The E2E suite must run headlessly with `npx playwright test` from the `web` directory.

## Non-Functional Requirements

- Keep the implementation in React + Vite + TypeScript.
- Do not add a new UI framework for this milestone.
- Do not add product features outside the Milestone 4 requirements.
- Keep the interface simple and mobile-tolerant, but full mobile/PWA behavior remains out of scope.
- Browser API calls must use a configurable API base URL through `VITE_API_URL`, with a local default.
- Test data must use unique identifiers to avoid collisions between runs.
- Generated Playwright artifacts must not be committed.
- Binary presentation files and assignment-reference files must not be modified.

## Content And Data Requirements

- Login fields:
  - email
  - password
- Todo list creation fields:
  - title
  - optional description
- Task creation fields:
  - title
  - optional description
  - todo list ID derived from the selected list
  - default or selected status using existing backend status values
- Task status values must stay compatible with the backend:
  - `pending`
  - `in_progress`
  - `done`
- Test users must use email addresses unique to each test run.

## Acceptance Criteria

- A user can authenticate through the web UI and see the authenticated todo screen.
- The JWT is present in browser storage after successful UI login.
- Reloading the page keeps the user authenticated while the JWT remains in storage.
- Logging out removes the JWT and returns to the login screen.
- A user can create a todo list through the web UI and see it rendered.
- A user can create a task for a todo list through the web UI and see it rendered.
- A user can delete a task through the web UI and no longer see it.
- A user can delete a todo list through the web UI and no longer see it.
- Running `npm run build` from `web` succeeds.
- Running `npx playwright test` from `web` passes with the backend validation API running.
