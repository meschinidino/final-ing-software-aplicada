# CI Delivery Evidence Validation

## Manual Validation

- Open the GitHub Actions tab for the repository.
- Confirm the CI workflow appears with a clear name.
- Open the latest run for a push to `main`.
- Confirm the backend test job completed successfully.
- Confirm the API image job completed successfully after the test job.
- Open the repository packages or organization packages page in GitHub.
- Confirm the API image package exists in GitHub Container Registry.
- Confirm the package includes a `latest` tag.
- Confirm the package includes a tag matching the commit SHA of the successful workflow run.
- Open a pull request run and confirm it runs tests without publishing a package.

## Technical Checks

- Verify workflow YAML is parseable:

```sh
ruby -e "require 'yaml'; YAML.load_file('.github/workflows/ci.yml')"
```

- Run backend tests locally:

```sh
make backend-test
```

- Build the API image locally:

```sh
docker build -t todolist-api:ci-check ./backend
```

- If Docker is unavailable locally, record the exact reason and rely on GitHub Actions build validation after pushing.

## GitHub Actions Checks

- Confirm the workflow is triggered by:
  - `push` to `main`
  - `pull_request` to `main`
- Confirm the workflow grants:
  - `contents: read`
  - `packages: write`
- Confirm `backend-test` runs before `api-image`.
- Confirm image publication is gated with an event condition equivalent to `github.event_name == 'push'`.
- Confirm the image is pushed to GHCR with:
  - `latest`
  - `${{ github.sha }}`

## Documentation Checks

- Confirm README or final verification notes mention:
  - `.github/workflows/ci.yml`
  - `go test ./...`
  - GHCR package path
  - `latest` and commit SHA tags
  - Publishing only on pushes to `main`

## Closure Criteria

- Workflow file is implemented.
- Backend tests pass locally.
- API image builds locally or a GitHub Actions run proves the build.
- A GitHub Actions run on `main` passes.
- The API image is visible in GHCR with both required tags.
- Documentation explains how to inspect the evidence.
- `specs/roadmap.md` is updated to mark Milestone 8 complete only after all implementation and validation checks pass.

## Validation Result

Implemented on 2026-06-29.

- Workflow YAML parse check: passed locally with `ruby -e "require 'yaml'; YAML.load_file('.github/workflows/ci.yml')"`.
- Backend tests: passed locally with `make backend-test`.
- API image build: passed locally with `docker build -t todolist-api:ci-check ./backend`.
- GitHub Actions run and GHCR package visibility: pending remote validation after pushing to GitHub.
