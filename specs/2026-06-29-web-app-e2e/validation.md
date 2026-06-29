# Web App and E2E Coverage Validation

Status: Implemented and validated on 2026-06-29.

## Manual Validation

1. Start the validation database:

   ```sh
   make db-up
   ```

2. Apply migrations:

   ```sh
   make migrate-up
   ```

3. Start the API:

   ```sh
   make api-up
   make api-status
   ```

4. Start the web app:

   ```sh
   cd web
   npm run dev
   ```

5. Open the local Vite URL.
6. Register a user through the API or use a user created by a test helper.
7. Log in through the visible login form.
8. Confirm the authenticated todo screen appears.
9. Create a todo list and confirm it appears.
10. Create a task for the todo list and confirm it appears.
11. Delete the task and confirm it disappears.
12. Delete the todo list and confirm it disappears.
13. Reload the page and confirm the authenticated session is restored while the JWT remains in browser storage.
14. Log out and confirm protected todo data is no longer visible.
15. Stop validation services when done:

   ```sh
   make validation-down
   ```

## Technical Checks

Run backend tests to confirm the API still passes after any enabling changes:

```sh
make backend-test
```

Build the web app:

```sh
cd web
npm run build
```

Run Playwright tests headlessly:

```sh
cd web
npx playwright test
```

If Playwright browser binaries are missing, install them locally before rerunning:

```sh
cd web
npx playwright install
```

## Expected Unit And E2E Tests

- Backend unit tests continue to pass with `make backend-test`.
- Playwright test 1:
  - registers a unique user through the API
  - logs in through the UI
  - verifies browser storage contains session state
  - verifies authenticated content is visible
- Playwright test 2:
  - registers and authenticates a unique user through `APIRequestContext`
  - writes `storageState`
  - loads the app with that state
  - performs an authenticated todo-list action
- Playwright test 3:
  - logs in through the UI
  - creates a todo list
  - creates a task
  - verifies both render
  - deletes the task
  - deletes the todo list
  - verifies deleted data is not visible

## Responsive And Accessibility Checks

- Login and todo workflows must remain usable at desktop width and a narrow mobile-like viewport.
- Form controls must have accessible labels.
- Buttons must have clear text labels.
- Error messages must be visible near the affected workflow.
- Keyboard users must be able to tab through login, create, delete, and logout controls in a sensible order.

## Closure Criteria

- `npm run build` passes from `web`.
- `npx playwright test` passes from `web`.
- `make backend-test` passes from the repository root.
- Manual login, create, delete, reload, and logout checks pass against the local validation API.
- Playwright tests do not require pre-seeded users.
- `specs/roadmap.md` is updated to mark Milestone 4 complete only after implementation and validation pass.

## Validation Results

- `make backend-test` passed.
- `npm run build` from `web` passed.
- `npm run test:e2e` from `web` passed with 3 Playwright tests.
- `make migrate-up` reported that the validation schema already existed, so the E2E run used the existing migrated validation database.
