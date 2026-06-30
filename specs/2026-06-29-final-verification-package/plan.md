# Final Verification Package Plan

## Objective

Prepare the TodoList project for final evaluation by adding a concise verification package that maps every assignment requirement to the implemented files, commands, and evidence a reviewer should inspect.

The package should make the existing implementation easy to validate without adding new product features.

## Scope

- Expand the README with a final evaluation path that covers setup, tests, Docker runtime, observability, PWA offline behavior, and CI/GHCR verification.
- Add committed text documentation for the final requirement checklist and evidence notes.
- Include local command evidence as text where it is stable and useful.
- Include short manual evidence notes for web login and CRUD, Playwright tests, Grafana LogQL, PWA offline behavior, and GHCR publication.
- Keep screenshots and remote-only proof, such as GitHub Actions runs and GHCR package pages, as manual verification items instead of committing binary assets.
- Record any validation command that cannot run locally, including the exact reason.
- Update `specs/roadmap.md` only after the verification package is implemented and checked.

## Out of Scope

- New TodoList product features.
- Reworking the backend, web, mobile, Docker, observability, or CI architecture.
- Committing screenshots, videos, generated Playwright reports, `dist/`, `node_modules/`, or other generated artifacts.
- Modifying binary presentation files or local assignment reference files.
- Claiming remote GitHub Actions or GHCR validation has passed before it is actually verified.

## Proposed Documentation Structure

Add a small documentation area under `docs/evaluation/`:

```text
docs/evaluation/
├── final-checklist.md
└── evidence.md
```

`final-checklist.md` should map each evaluated requirement to:

- implementation file or directory;
- verification command or manual check;
- expected result;
- current status.

`evidence.md` should collect:

- local validation command outputs in summarized text form;
- manual evidence placeholders for web login and CRUD, screenshots, and remote checks;
- links or paths to the relevant workflow, runtime, PWA, and observability instructions.

The README should remain the entry point and point evaluators to these files instead of becoming too long.

## Implementation Steps

1. Review current README coverage against `specs/mission.md`, `specs/tech-stack.md`, and Milestone 9 in `specs/roadmap.md`.
2. Create `docs/evaluation/final-checklist.md` with a requirement-by-requirement matrix.
3. Create `docs/evaluation/evidence.md` with local command evidence sections and manual verification placeholders.
4. Update `README.md` with a short "Final evaluation" section that links to the checklist and evidence notes.
5. Run local validation commands that are feasible in the current environment:
   - `make backend-test`
   - `cd web && npx playwright test`
   - `docker compose -p todolist-runtime -f deploy/docker-compose.yml up -d --build --wait`
   - `docker compose -p todolist-runtime -f deploy/docker-compose.yml ps`
   - `cd mobile && npm run build`
6. Summarize results in `docs/evaluation/evidence.md`, keeping command output concise and excluding secrets.
7. If validation passes or known external checks are clearly marked pending, update `specs/roadmap.md` to mark Milestone 9 implemented locally.

## Risks and Decisions

- Docker may be unavailable or slow in the current environment. If so, document the blocked command and keep the evaluator-facing Docker instructions explicit.
- Playwright may require a running API, database, or browser dependencies. The validation notes should state the setup used or the reason for failure.
- Remote GitHub Actions and GHCR cannot be fully proven without a pushed branch and repository access. The package should distinguish local readiness from remote validation.
- Screenshots are useful for human review but can add binary churn. The selected hybrid approach keeps screenshots outside git and commits text evidence/checklists only.

## Expected Result

An evaluator can start from the README, follow a single final verification path, and confirm every mission requirement through committed documentation, local commands, and clearly identified manual checks.

Implementation should not begin until this plan, `requirements.md`, and `validation.md` are approved.
