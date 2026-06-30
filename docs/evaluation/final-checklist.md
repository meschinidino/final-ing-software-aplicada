# Checklist final de evaluacion

Este checklist mapea cada requisito evaluable del proyecto con los archivos implementados y la forma esperada de verificacion. Los checks remotos de GitHub Actions y GHCR quedan pendientes hasta hacer push al repositorio remoto.

| Area evaluada | Implementacion | Verificacion | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| Modelo de dominio | `backend/internal/domain/models.go`, `backend/migrations/000001_create_core_schema.up.sql` | Revisar entidades `User`, `TodoList`, `Task`, `Tag` y tabla `task_tags` | Relaciones usuario-listas, lista-tareas y tarea-etiquetas presentes | implemented |
| API REST protegida | `backend/internal/handlers/router.go` | Revisar rutas bajo `/api` y ejecutar flujo manual con token JWT | CRUD de listas, tareas y etiquetas protegido por autenticacion | implemented |
| Autenticacion JWT | `backend/internal/auth/service.go`, `backend/internal/middleware/auth.go` | `make backend-test` | Tokens firmados y middleware rechaza requests sin token valido | validated locally |
| Persistencia PostgreSQL y migraciones | `backend/internal/database/database.go`, `backend/migrations/` | `make db-reset` y `make migrate-up` | Schema creado desde cero en PostgreSQL 16 | manual check |
| Pruebas unitarias backend | `backend/internal/auth/service_test.go`, `backend/internal/handlers/router_test.go` | `make backend-test` | `go test ./...` pasa en backend | validated locally |
| Pruebas E2E Playwright | `web/e2e/todolist.spec.ts`, `web/playwright.config.ts` | `cd web` y `npx playwright test` | Login UI, storage state por API y CRUD UI pasan en headless | validated locally |
| Runtime Docker Compose | `deploy/docker-compose.yml`, `backend/Dockerfile`, `web/Dockerfile` | `make runtime-up` y `make runtime-status` | API, web, db, Loki, Alloy y Grafana levantan con proyecto `todolist-runtime` | validated locally |
| Observabilidad Loki/Grafana | `deploy/loki/`, `deploy/alloy/`, `deploy/grafana/` | En Grafana Explore ejecutar `{compose_project="todolist-runtime", compose_service="api"}` | Logs del contenedor API visibles en Loki | validated locally |
| Web login y CRUD | `web/src/main.tsx`, `web/src/api.ts` | Abrir `http://localhost:5173` con runtime activo | Login, creacion y borrado de datos visibles en UI | covered by E2E and manual check |
| Ionic PWA/offline | `mobile/src/main.tsx`, `mobile/src/api.ts`, `mobile/vite.config.ts`, `mobile/public/manifest.webmanifest` | `cd mobile` y `npm run build` | Build PWA genera app instalable con service worker y manifest | validated locally |
| Cache offline PWA | `mobile/src/api.ts`, `mobile/src/main.tsx` | Preview de produccion, cargar datos online, cortar red y recargar | App shell carga y muestra ultimo snapshot local | manual check |
| GitHub Actions CI | `.github/workflows/ci.yml` | Revisar workflow y, luego de push, pestaña Actions | Job `Backend tests` corre en push y pull request a `main` | pending remote validation |
| Publicacion GHCR | `.github/workflows/ci.yml` | Ver paquete `ghcr.io/<github-owner>/todolist-api` despues de push a `main` | Tags `latest` y `<commit-sha>` publicados para la API | pending remote validation |

## Comandos principales

Backend:

```sh
make backend-test
```

Playwright:

```sh
cd web
npx playwright test
```

Runtime completo:

```sh
make runtime-up
```

Estado del runtime:

```sh
make runtime-status
```

Build mobile/PWA:

```sh
cd mobile
npm run build
```

Consulta LogQL esperada:

```logql
{compose_project="todolist-runtime", compose_service="api"}
```

Imagen GHCR esperada:

```text
ghcr.io/<github-owner>/todolist-api
```
