# Mission

## Project

Build a simple TodoList application for the final project of **Ingenieria de Software Aplicada**.

The product is intentionally small: users authenticate, manage todo lists, create tasks, and organize tasks with tags. The real objective is not feature breadth. The objective is to demonstrate, with verifiable evidence, the tools and practices covered during the subject.

## Purpose

This project exists to prove that a complete software product can be designed, implemented, tested, containerized, observed, delivered through CI, and used as a Progressive Web App.

The application must make each evaluated requirement visible:

- Domain modeling through users, todo lists, tasks, and tags.
- REST API design with protected CRUD endpoints.
- JWT authentication.
- Database persistence with versioned migrations.
- Unit tests for backend logic.
- End-to-end tests for real user flows.
- Docker-based local deployment.
- Centralized logs with Loki, Grafana Alloy, and Grafana.
- Mobile-oriented Ionic React app.
- Offline PWA behavior.
- GitHub Actions pipeline that tests, builds, and publishes a container image.

## Product Scope

The TodoList app will support:

- User registration or seeded users for login.
- Login with JWT persistence.
- Todo list CRUD.
- Task CRUD inside a todo list.
- Tag CRUD.
- Assigning tags to tasks.
- Viewing tasks by list and tag.
- Basic offline access to the last loaded mobile/PWA state.

The web and mobile interfaces should stay minimal. They exist to exercise the API, authentication, E2E tests, and PWA behavior, not to become a complex productivity product.

## Success Criteria

The project is successful when an evaluator can:

- Start the stack with Docker Compose.
- Log in through the web app.
- Create, list, update, and delete todo data.
- Run backend unit tests with `go test ./...`.
- Run three Playwright E2E tests headlessly.
- Open Grafana and query API container logs through Loki.
- Use the Ionic app as a PWA and reload cached data while offline.
- See a GitHub Actions workflow that tests the backend and publishes the API image to GitHub Container Registry.

## Non-Goals

- Advanced task scheduling, reminders, collaboration, or notifications.
- Complex UI/UX beyond what is needed for clear evaluation.
- Multi-tenant authorization beyond each user owning their own lists/tasks.
- Production-grade scaling, cloud infrastructure, or Kubernetes.

## Guiding Principle

Prefer simple, inspectable implementation over unnecessary abstraction. Every feature should map directly to an evaluated requirement or make that requirement easier to verify.
