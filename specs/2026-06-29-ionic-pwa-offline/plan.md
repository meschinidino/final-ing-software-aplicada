# Ionic PWA and Offline Behavior Plan

## Objective

Implement Milestone 7 by turning the current mobile skeleton into a minimal Ionic React PWA that authenticates against the existing API, displays todo data, is installable, and shows the last loaded todo data when offline.

This plan covers the full Milestone 7 scope selected by the user before implementation.

## Scope

- Replace the mobile skeleton with a small Ionic React workflow for evaluator use.
- Add API client code for:
  - `POST /api/register`
  - `POST /api/authenticate`
  - protected todo list reads
  - protected task reads for the selected todo list or available task list endpoint
- Persist the JWT in browser storage after login.
- Display authenticated todo data from the same backend API used by the web app.
- Cache the last successfully loaded todo data in local browser storage.
- Display cached todo data when fresh API loading fails because the app is offline or the API is unavailable.
- Configure `vite-plugin-pwa` so the built app has:
  - an installable manifest
  - a registered service worker
  - cached app shell assets
- Add mobile/PWA documentation for evaluator validation.
- Keep the implementation minimal and aligned with the existing TodoList product scope.

## Out Of Scope

- New backend endpoints or schema changes unless an existing API bug blocks the mobile milestone.
- Full task, list, or tag CRUD in the mobile app.
- Push notifications, reminders, collaboration, background sync, or native mobile packaging.
- Advanced offline mutation queues or conflict resolution.
- Visual redesign of the web app.
- CI and delivery evidence, which belongs to Milestone 8 and Milestone 9.

## Proposed Architecture

The mobile app remains a Vite-powered Ionic React application under `mobile/`.

The implementation should keep the surface small:

- `mobile/src/main.tsx` renders the Ionic app shell.
- A small API helper handles base URL resolution, JSON requests, and bearer-token headers.
- The API base URL uses `VITE_API_URL`, defaulting to `http://localhost:8080`.
- The JWT is stored in `localStorage` under a stable mobile-specific key.
- Last loaded todo data is stored in `localStorage` as a compact snapshot that includes todo lists and tasks.
- The app treats the backend as the source of truth when online and treats the cached snapshot as read-only fallback data when offline.
- `vite-plugin-pwa` generates and registers the service worker during production builds.
- The manifest is updated with useful app metadata and simple local icons if practical.

The UI should be mobile-oriented but simple:

- Login/register form.
- Authenticated todo data screen.
- Clear online/offline or cached-data state.
- Refresh action to reload data from the API.
- Logout action that clears the JWT but does not need to erase cached data unless that keeps user ownership clearer.

## Implementation Steps

1. Inspect the existing web API client and Playwright flows for request payloads and local storage conventions worth reusing.
2. Replace the mobile placeholder with an Ionic app that supports registration/login, JWT persistence, loading state, error state, refresh, and logout.
3. Add mobile API helper functions for authentication and todo data reads.
4. Add a small todo snapshot model for cached offline display.
5. Save the latest successful authenticated todo data response to local storage.
6. When API loading fails, load and display the cached snapshot with clear cached/offline status.
7. Update `mobile/vite.config.ts` so `vite-plugin-pwa` precaches the app shell and registers the service worker for production builds.
8. Update `mobile/public/manifest.webmanifest` with installable PWA metadata and icon references or generated local icons.
9. Add README instructions for:
   - running the backend and mobile app
   - building and previewing the PWA
   - installing or verifying installability
   - validating cached offline behavior
10. Run the mobile build and any available type checks.
11. Validate the production preview manually enough to prove app shell caching and cached todo display.
12. Update `specs/roadmap.md` only after implementation and validation pass.

## Risks And Decisions

- Service workers are only meaningful in a production build or preview context. Development mode may not prove installability or app-shell caching.
- Browser offline simulation must distinguish API unavailability from first-load cache absence. The app should show an explicit empty-cache state if no todo snapshot has been loaded yet.
- The current mobile scaffold has no generated Ionic routing structure. Keeping the app in one or a few files is acceptable for this evaluation-focused milestone.
- PWA icon requirements can be tedious. Use simple generated local icons if no project artwork exists, and keep them committed only if they are deterministic source assets.
- The API currently supports full CRUD, but this milestone only needs mobile login, data display, and offline read fallback. Avoid expanding mobile CRUD unless validation reveals it is needed for evaluator confidence.

## Expected Result

After implementation, a reviewer can run the backend, open the mobile app, register or log in, see todo list/task data from the API, build and preview the app as an installable PWA, disable network access after a successful load, reload the app, and still see the last cached todo data.
