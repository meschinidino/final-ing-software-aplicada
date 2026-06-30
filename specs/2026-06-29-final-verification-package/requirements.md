# Final Verification Package Requirements

## Functional Requirements

- The repository must include a final evaluation checklist under `docs/evaluation/`.
- The checklist must map each required evaluation area to implemented files and verification steps:
  - domain model;
  - REST API and protected CRUD endpoints;
  - JWT authentication;
  - PostgreSQL migrations;
  - backend unit tests;
  - Playwright E2E tests;
  - Docker Compose runtime;
  - Loki, Grafana Alloy, and Grafana observability;
  - Ionic PWA and offline cached display;
  - GitHub Actions CI;
  - GitHub Container Registry image publishing.
- The repository must include text evidence notes under `docs/evaluation/`.
- Evidence notes must separate:
  - local command checks;
  - manual web login and CRUD checks;
  - manual UI checks;
  - manual Grafana/LogQL checks;
  - manual PWA offline checks;
  - remote GitHub Actions/GHCR checks.
- The README must include a final evaluation section that points to the checklist and evidence notes.
- The README must keep existing setup and usage commands available to evaluators.
- The documentation must identify any checks that are pending remote validation.
- The documentation must include short notes for the Milestone 9 evidence areas when screenshots are not committed:
  - web login and CRUD;
  - Playwright tests;
  - Grafana LogQL query;
  - PWA offline behavior;
  - GitHub Container Registry image.
- The documentation must avoid committing screenshots, videos, Playwright reports, generated builds, package folders, or local runtime data.

## Non-Functional Requirements

- Documentation must be concise and practical for a course evaluator.
- Documentation must be written in the same plain Spanish style already used by the README, unless quoting command names or file names.
- Commands must be copy-pasteable.
- Status labels must not overstate validation. Use clear states such as `implemented`, `validated locally`, `pending remote validation`, or `manual check`.
- The package must preserve the existing simple repository structure.
- No secrets, tokens, `.env` values, private URLs, or personal credentials may be included.
- The change must not modify binary assets or local assignment reference files.

## Content Requirements

- The final checklist must include the expected command for backend tests:

```sh
make backend-test
```

- The final checklist must include the expected command for Playwright tests:

```sh
cd web
npx playwright test
```

- The final checklist must include the expected Docker runtime command:

```sh
make runtime-up
```

- The final checklist must include the expected mobile/PWA production build command:

```sh
cd mobile
npm run build
```

- The final checklist must include the expected Grafana LogQL query:

```logql
{compose_project="todolist-runtime", compose_service="api"}
```

- The final checklist must include the expected CI/GHCR image path pattern:

```text
ghcr.io/<github-owner>/todolist-api
```

## Acceptance Criteria

- `docs/evaluation/final-checklist.md` exists and covers every success criterion from `specs/mission.md`.
- `docs/evaluation/evidence.md` exists and records local validation results or exact blocked reasons.
- `README.md` links to both evaluation documents.
- The evaluation docs point to existing implementation files and commands instead of inventing new architecture.
- Local validation commands are run where feasible before marking the roadmap step complete.
- Remote-only checks are clearly marked as pending/manual unless verified after push.
- `specs/roadmap.md` is updated for Milestone 9 only after implementation and validation are complete.
