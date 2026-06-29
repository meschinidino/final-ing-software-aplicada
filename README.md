# TodoList

Aplicacion TodoList desarrollada como trabajo final de **Ingenieria de Software Aplicada**.

**Alumno:** Dino Meschini

El producto es simple a proposito: permite autenticar usuarios, administrar listas de tareas, crear tareas y organizarlas con etiquetas. El foco principal no esta en la cantidad de funcionalidades, sino en demostrar un flujo completo de desarrollo de software: modelado, API, persistencia, pruebas, contenedores, observabilidad, PWA y entrega continua.

## Objetivo

Este repositorio busca mostrar una aplicacion completa y verificable. Una persona evaluadora deberia poder levantar el sistema, usar los flujos principales, ejecutar pruebas y revisar la evidencia tecnica sin tener que adivinar como esta armado el proyecto.

## Funcionalidades previstas

- Autenticacion de usuarios con JWT.
- CRUD de listas de tareas.
- CRUD de tareas dentro de una lista.
- CRUD de etiquetas.
- Asignacion de etiquetas a tareas.
- Vista web para operar los flujos principales.
- Experiencia mobile/PWA con soporte basico offline.
- Pruebas automatizadas para backend y flujos end-to-end.
- Ejecucion local reproducible con Docker Compose.
- Logs centralizados con Loki, Grafana Alloy y Grafana.
- Pipeline de CI/CD con GitHub Actions y publicacion de imagen Docker.

## Stack tecnologico

- **Backend:** Go, Gin, GORM, golang-migrate, golang-jwt.
- **Base de datos:** PostgreSQL.
- **Web:** React, Vite, TypeScript.
- **Mobile/PWA:** Ionic React, Vite, vite-plugin-pwa.
- **E2E:** Playwright.
- **Runtime local:** Docker y Docker Compose.
- **Observabilidad:** Loki, Grafana Alloy y Grafana.
- **CI/CD:** GitHub Actions y GitHub Container Registry.

## Modelo de dominio

La aplicacion adapta un dominio clasico de contenido a un producto de tareas:

- `User` representa al usuario propietario de los datos.
- `TodoList` representa una lista creada por un usuario.
- `Task` representa una tarea dentro de una lista.
- `Tag` representa una etiqueta reutilizable para clasificar tareas.

Relaciones principales:

- Un usuario tiene muchas listas.
- Una lista tiene muchas tareas.
- Una tarea puede tener muchas etiquetas.
- Una etiqueta puede estar asociada a muchas tareas.

## Estructura general

```text
backend/   API, dominio, persistencia y migraciones
web/       Cliente web en React
mobile/    Cliente mobile/PWA en Ionic React
deploy/    Configuracion de runtime local y observabilidad
specs/     Definicion del producto, roadmap y decisiones tecnicas
```

## Comandos utiles

Verificar que el backend compile:

```sh
cd backend
go test ./...
```

En entornos donde el cache global de Go no sea escribible, se puede usar un cache local:

```sh
cd backend
GOCACHE=../.gocache go test ./...
```

Ejecutar la API backend contra una base PostgreSQL con las migraciones aplicadas:

```sh
cd backend
DATABASE_URL=postgres://postgres:postgres@localhost:5432/todolist?sslmode=disable \
APP_ENV=development \
go run ./cmd/api
```

Variables relevantes:

- `API_ADDR`: direccion de escucha, por defecto `:8080`.
- `DATABASE_URL`: conexion PostgreSQL.
- `JWT_SECRET`: secreto para firmar JWT. Es obligatorio salvo cuando `APP_ENV=development`.
- `APP_ENV`: usar `development` solo para ejecucion local; habilita un secreto JWT local por defecto.
- `JWT_TTL_MINUTES`: duracion del token, por defecto `60`.

Endpoints principales del backend:

- `GET /health`
- `POST /api/register`
- `POST /api/authenticate`
- `GET|POST /api/todo-lists`
- `GET|PUT|DELETE /api/todo-lists/:id`
- `GET|POST /api/tasks`
- `GET|PUT|DELETE /api/tasks/:id`
- `PUT /api/tasks/:id/tags`
- `GET|POST /api/tags`
- `GET|PUT|DELETE /api/tags/:id`

## Documentacion del proyecto

La definicion del alcance y las decisiones tecnicas viven en `specs/`:

- `specs/mission.md`
- `specs/roadmap.md`
- `specs/tech-stack.md`

Esos archivos son la fuente de verdad para el orden de implementacion y los criterios de evaluacion.
