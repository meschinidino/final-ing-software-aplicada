# Ionic PWA and Offline Behavior Requirements

## Functional Requirements

- The mobile app must allow a user to register or authenticate through the existing backend API.
- The mobile app must persist the JWT after successful authentication.
- The mobile app must restore an authenticated session from persisted JWT on reload.
- The mobile app must request todo data from protected API endpoints using the persisted JWT.
- The mobile app must display todo list data returned by the API.
- The mobile app must display task data associated with the loaded todo lists when available.
- The mobile app must provide a refresh action that attempts to reload todo data from the API.
- The mobile app must cache the last successfully loaded todo snapshot locally.
- The mobile app must display the cached todo snapshot when online API loading fails after a previous successful load.
- The mobile app must clearly indicate when displayed data is cached/offline data.
- The mobile app must provide a logout action that clears the persisted JWT.
- The production mobile build must register a service worker.
- The production mobile build must include a web app manifest suitable for PWA install prompts.

## Non-Functional Requirements

- The implementation must stay minimal and evaluator-focused.
- The mobile UI must be usable on a narrow mobile viewport without horizontal scrolling.
- The app shell should load from service worker cache after the first production visit.
- Offline cached todo display must be read-only; no offline mutation queue is required.
- API errors must be visible enough for validation without exposing secrets.
- No secrets or environment-specific credentials may be committed.
- The app must use `VITE_API_URL` for backend URL configuration, defaulting to local development.
- The implementation must not change backend behavior unless needed to fix a blocking compatibility issue.

## Content And Data Requirements

- Cached todo data must include enough information to show:
  - todo list titles
  - task titles
  - task status when available
- Cached data should include a timestamp or equivalent metadata so the UI can show that the snapshot is not freshly loaded.
- Manifest metadata must include:
  - app name
  - short name
  - start URL
  - standalone display mode
  - theme/background colors
  - icons if generated or available

## Acceptance Criteria

- A user can register or log in from the mobile UI against the running local API.
- Reloading the mobile app after login keeps the authenticated session.
- With the API available, the mobile app loads and displays todo data from protected endpoints.
- After at least one successful todo data load, stopping the API or disabling network causes the mobile app to display the cached snapshot instead of an unusable blank state.
- The UI explicitly labels cached/offline data during fallback display.
- `npm run build` succeeds in `mobile/`.
- The production preview includes a registered service worker and a valid manifest.
- README or developer notes explain how to validate installability and offline cached data.
- `specs/roadmap.md` remains unchanged until implementation and validation are complete.
