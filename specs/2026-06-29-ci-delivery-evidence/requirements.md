# CI Delivery Evidence Requirements

## Functional Requirements

- The repository must include `.github/workflows/ci.yml`.
- The workflow must run on push events targeting `main`.
- The workflow must run on pull request events targeting `main`.
- The workflow must run backend tests with:

```sh
go test ./...
```

- Backend tests must run before any image publication step.
- The workflow must build the API image using the existing backend Dockerfile.
- The workflow must authenticate to GitHub Container Registry with the repository `GITHUB_TOKEN`.
- The workflow must publish the API image on pushes to `main`.
- The workflow must not publish images for pull request events.
- The published image must include a `latest` tag.
- The published image must include a commit SHA tag.
- The workflow must use GitHub context values for owner/repository data instead of hard-coding a personal account.

## Non-Functional Requirements

- The workflow should be easy to inspect for an evaluator.
- The workflow should use maintained GitHub Actions.
- CI should avoid unnecessary jobs, matrix builds, or delivery complexity.
- Package publishing permissions should be limited to what the workflow needs.
- The workflow should not require custom repository secrets.
- The workflow should not expose credentials in logs.
- CI changes must not alter runtime behavior of the application.

## Configuration Requirements

- Workflow permissions must include:
  - `contents: read`
  - `packages: write`
- The backend test job must run from the `backend/` directory or otherwise target the backend Go module correctly.
- The image build context must match the existing Dockerfile expectations.
- The image name must be documented.
- The expected tags must be documented:
  - `ghcr.io/<github-owner>/todolist-api:latest`
  - `ghcr.io/<github-owner>/todolist-api:<commit-sha>`

## Documentation Requirements

- README or the final verification notes must describe:
  - The workflow file path.
  - The events that trigger CI.
  - The backend test command run by CI.
  - The API image package name.
  - The two expected GHCR tags.
  - That image publication happens only for pushes to `main`.

## Acceptance Criteria

- `.github/workflows/ci.yml` exists and is valid YAML.
- The workflow contains a backend test job.
- The workflow contains an API image build/publish job that depends on the test job.
- The API image job is gated so it only pushes on `push` events to `main`.
- Local backend tests pass before the workflow is considered ready.
- The API Docker image builds locally before the workflow is considered ready.
- README or verification notes explain how an evaluator confirms the GitHub Actions run and GHCR package.
- `specs/roadmap.md` is marked complete for Milestone 8 only after implementation and validation are complete.

