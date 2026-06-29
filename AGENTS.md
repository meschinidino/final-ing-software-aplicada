# AGENTS.md

Guidance for AI coding agents working in this repository.

## Repository State

- This repository is the final project for **Ingenieria de Software Aplicada**.
- The current committed project definition lives in `specs/`:
  - `specs/mission.md`
  - `specs/roadmap.md`
  - `specs/tech-stack.md`
- The planned product is a simple TodoList application used to demonstrate the tools required by the subject.
- The assignment brief `trabajo-final-specs.md` may exist locally as reference material. Do not commit it unless the user explicitly asks.
- Treat binary presentation files, such as `.key`, as primary user assets. Do not modify, rename, delete, or regenerate them unless explicitly requested.

## Planned Stack

- Backend: Go 1.22+, Gin, GORM, golang-migrate, golang-jwt.
- Database: PostgreSQL 16.
- Web: React + Vite + TypeScript.
- Mobile/PWA: Ionic React + `vite-plugin-pwa`.
- E2E: Playwright.
- Runtime: Docker + Docker Compose.
- Logs: Loki + Grafana Alloy + Grafana.
- CI/package publishing: GitHub Actions + GitHub Container Registry.

## Working Rules

- Inspect the workspace before making changes.
- Keep edits narrowly scoped to the user request.
- Do not overwrite user-created files or untracked work.
- Prefer adding new text documentation over changing binary files when capturing notes or process.
- Use clear filenames and keep repository structure simple until a fuller project layout exists.
- Preserve the constitution in `specs/` as the source of truth for scope and implementation order.
- Do not introduce extra product features unless they support the evaluation requirements.
- Prefer simple, verifiable implementation over broad abstractions.

## Verification

- For documentation-only changes, verify by reading the edited file.
- Backend verification: `go test ./...`.
- E2E verification: `npx playwright test`.
- Container verification: `docker compose up` from the deployment directory once implemented.
- For future code changes, add or update the relevant local verification commands here as the project structure becomes concrete.
