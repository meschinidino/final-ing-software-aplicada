# Ionic PWA and Offline Behavior Validation

Status: Implemented and validated on 2026-06-29.

## Manual Validation

Run these checks after implementation:

1. Start the backend API and PostgreSQL validation/runtime database using the documented project commands.
2. Start the mobile app locally with `VITE_API_URL` pointing at the API.
3. Register a new evaluator user or log in with an existing test user.
4. Confirm the app stores the session and returns to the authenticated screen after browser reload.
5. Ensure todo data exists for the authenticated user, either by using existing API/web flows or by adding data through documented API calls.
6. Refresh the mobile app data and confirm todo lists and tasks render in the mobile UI.
7. Stop the API, block network access, or use browser devtools offline mode.
8. Reload the mobile app.
9. Confirm the app shell still loads.
10. Confirm the last loaded todo data still displays with a cached/offline state indicator.
11. Log out and confirm protected data is no longer fetched with the previous JWT.

## Technical Checks

Run from the `mobile/` directory unless noted otherwise:

```sh
npm run build
npm run preview
```

If dependencies are not installed, install them through the project's normal package manager workflow before running the checks.

When the production preview is running:

- Verify the manifest is available from the built app.
- Verify a service worker is registered in browser devtools.
- Verify the app can be reloaded after switching devtools to offline mode following a successful online load.

## Expected Automated Tests

No new automated PWA E2E test is required for this planning slice unless implementation adds an easy, stable Playwright path for offline checks.

If automated coverage is practical, add one focused check that:

- Opens the production preview.
- Confirms manifest/service-worker registration signals are present.
- Seeds or loads a todo snapshot.
- Simulates API failure or offline mode.
- Confirms cached todo content remains visible.

## Responsive And Accessibility Checks

- Test at a phone-sized viewport around 390x844.
- Confirm the login form, todo list, refresh action, cached indicator, and logout action are visible without horizontal scrolling.
- Confirm form controls have accessible labels.
- Confirm button text or icons have accessible names.
- Confirm cached/offline status is text-visible, not color-only.

## Closure Criteria

- All acceptance criteria in `requirements.md` pass.
- The documented technical checks pass or any environment blocker is recorded with exact commands and error output.
- Manual offline validation proves both app-shell loading and cached todo display after a previous successful load.
- README or developer notes include evaluator-facing PWA/offline verification steps.
- Only after successful implementation and validation should Milestone 7 be marked complete in `specs/roadmap.md`.

## Validation Results

- `npm install` completed in `mobile/` and generated `package-lock.json`.
- `npm run build` from `mobile/` passed.
- The production build generated `dist/sw.js`, `dist/registerSW.js`, and `dist/manifest.webmanifest`.
- `npm run preview -- --host 127.0.0.1` served the built mobile PWA at `http://127.0.0.1:4174/`.
- `curl http://127.0.0.1:4174/manifest.webmanifest` returned the expected TodoList Mobile manifest.
- `curl -I http://127.0.0.1:4174/sw.js` returned `200 OK`.
- The preview HTML included the manifest link and the injected `registerSW.js` service worker registration script.
- A one-off Playwright check loaded the production preview, waited for the service worker, seeded a local cached todo snapshot, switched the browser context offline, reloaded, and confirmed the `Offline cache` indicator plus cached list/task content rendered.
- A one-off Playwright check mocked protected API calls with `401` responses, seeded cached todo data, reloaded, and confirmed the app returned to login instead of rendering cached protected data after an auth failure.
- `make backend-test` passed after the CORS origin update.
