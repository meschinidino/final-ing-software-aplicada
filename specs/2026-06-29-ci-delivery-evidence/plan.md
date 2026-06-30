# CI Delivery Evidence Plan

## Objective

Implement Milestone 8 by adding a GitHub Actions workflow that proves the backend test suite runs automatically and publishes the API container image to GitHub Container Registry.

The target result is that an evaluator can inspect one workflow file, see tests run before publication, and find the API image published with both `latest` and commit SHA tags.

## Planning Decision

The structured question tool was used to confirm scope. The selected scope is:

- Follow the roadmap literally.
- Add CI for backend tests.
- Build and publish only the API image to GitHub Container Registry.
- Do not add web image publishing in this milestone.

## Scope

- Add `.github/workflows/ci.yml`.
- Run the backend Go tests on push and pull request events targeting `main`.
- Configure workflow permissions for package publishing.
- Build the API Docker image from `backend/Dockerfile`.
- Authenticate to GitHub Container Registry with the repository `GITHUB_TOKEN`.
- Push the API image to `ghcr.io/<github-owner>/<app>` on pushes to `main`.
- Tag the image as:
  - `latest`
  - `<commit-sha>`
- Keep pull request runs test/build focused and avoid publishing images from unmerged PRs.
- Document the CI workflow and expected GHCR image tags in README or the final verification package.

## Out Of Scope

- Publishing the web image.
- Publishing the mobile/PWA app.
- Deploying to a cloud runtime.
- Adding release automation, semantic versioning, or changelog generation.
- Changing application behavior, API endpoints, database schema, or UI.
- Final evaluation screenshots and full checklist packaging, which belongs to Milestone 9.

## Proposed Workflow Architecture

Use one GitHub Actions workflow with two jobs:

- `backend-test`: checks out the repo, sets up Go, and runs `go test ./...` from `backend/`.
- `api-image`: runs after `backend-test`, builds the API Docker image, logs in to GHCR, and pushes tags only on `push` events to `main`.

The workflow should use GitHub Actions built-in context values rather than hard-coded owner names:

- Registry: `ghcr.io`
- Image name: `ghcr.io/${{ github.repository_owner }}/todolist-api`
- Commit tag: `${{ github.sha }}`

If the repository name should be part of the package name instead, the implementation can use `ghcr.io/${{ github.repository_owner }}/${{ github.event.repository.name }}-api`, but the simpler `todolist-api` package is preferred for evaluator readability.

## Implementation Steps

1. Inspect the current backend module and Dockerfile to confirm the correct test and build contexts.
2. Add `.github/workflows/ci.yml`.
3. Configure workflow triggers for:
   - `push` to `main`
   - `pull_request` to `main`
4. Add minimal workflow permissions:
   - `contents: read`
   - `packages: write`
5. Add the backend test job using Go 1.22 or the Go version declared by `backend/go.mod`.
6. Add the API image job using Docker Buildx or standard Docker build/push actions.
7. Ensure image publishing is skipped for pull request events.
8. Add README notes describing:
   - What the workflow runs.
   - Which events trigger it.
   - Where the GHCR image should appear.
   - The expected `latest` and commit SHA tags.
9. Validate the workflow syntax locally as far as possible, then record any checks that require GitHub remote execution.
10. Update `specs/roadmap.md` only after implementation and validation confirm Milestone 8 is complete.

## Risks And Decisions

- GitHub Container Registry publishing cannot be fully proven locally; final validation requires pushing to GitHub and inspecting the Actions run/package output.
- Pull requests from forks may not receive package write permissions. Publishing should be gated to `push` on `main` to keep PR validation reliable.
- The workflow should avoid reading secrets beyond the built-in `GITHUB_TOKEN`.
- The project already has Docker runtime files. The CI implementation should reuse `backend/Dockerfile` and avoid adding a second image definition.
- The API image package name should be easy for an evaluator to find in GHCR. Prefer `todolist-api` unless the user wants a repository-derived package name.

## Expected Result

After implementation, GitHub Actions will test the backend on every push and pull request to `main`. On pushes to `main`, the workflow will build the API image and publish it to GitHub Container Registry with `latest` and commit SHA tags.

