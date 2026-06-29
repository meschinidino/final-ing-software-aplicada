# Backend API and Authentication Requirements

## Functional Requirements

- The backend must expose `GET /health`.
- The backend must expose `POST /api/register`.
- The backend must expose `POST /api/authenticate`.
- Registration must accept email and password, canonicalize email before persistence or enforce case-insensitive uniqueness in the schema, hash the password, and reject duplicate emails regardless of letter casing.
- Authentication must verify email and password and return a signed JWT with an expiration claim.
- JWT validation must reject expired tokens.
- Protected API endpoints must require an `Authorization: Bearer <token>` header.
- Requests without a valid JWT must return `401`.
- Authenticated users must be able to create, read, update, and delete their own todo lists.
- Authenticated users must be able to create, read, update, and delete tasks in their own todo lists.
- Authenticated users must be able to create, read, update, and delete their own tags.
- Authenticated users must be able to assign tags to tasks they own.
- Users must not be able to read, modify, delete, or assign resources owned by another user.
- API responses must use JSON.
- Invalid request bodies and missing required fields must return `400`.
- Missing resources, including resources hidden by ownership checks, must return `404`.

## API Requirements

Authentication:

```text
POST /api/register
POST /api/authenticate
```

Protected todo list endpoints:

```text
GET    /api/todo-lists
POST   /api/todo-lists
GET    /api/todo-lists/:id
PUT    /api/todo-lists/:id
DELETE /api/todo-lists/:id
```

Protected task endpoints:

```text
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

Protected tag endpoints:

```text
GET    /api/tags
POST   /api/tags
GET    /api/tags/:id
PUT    /api/tags/:id
DELETE /api/tags/:id
```

Task-tag assignment may be implemented through one of these compatible shapes:

```text
PUT /api/tasks/:id/tags
```

or through tag IDs in task create/update payloads.

## Non-Functional Requirements

- The backend must compile with Go 1.22 or newer.
- Persistence must use PostgreSQL through GORM.
- Database schema changes, if needed, must be added as versioned migrations.
- Existing migrations must remain append-only.
- JWT creation and validation must use `golang-jwt`.
- Password hashes must not store plaintext passwords.
- Configuration must come from environment variables with local development defaults where reasonable.
- The code should remain small and inspectable for final-project evaluation.
- Binary presentation files and assignment-reference files must not be modified.

## Content and Data Requirements

- User input must include email and password for registration and login.
- Todo list payloads must include title and may include description.
- Task payloads must include todo list ID and title, and may include description, status, due date, and tag IDs.
- Task status must stay within the existing values:
  - `pending`
  - `in_progress`
  - `done`
- Tag payloads must include name and may include color.
- JWT claims must identify the authenticated user.

## Acceptance Criteria

- `GET /health` returns a successful JSON response.
- A user can register through `POST /api/register`.
- The same user can authenticate through `POST /api/authenticate` and receive a JWT.
- A request to a protected endpoint without a token returns `401`.
- A request to a protected endpoint with a valid token succeeds.
- A user can create, list, update, and delete a todo list.
- A user can create, list, update, and delete a task in their own todo list.
- A user can create, list, update, and delete a tag.
- A user can assign one of their tags to one of their tasks.
- A second user cannot access or mutate the first user's todo lists, tasks, tags, or task-tag assignments.
- Backend checks pass with `go test ./...` from the `backend` directory.
