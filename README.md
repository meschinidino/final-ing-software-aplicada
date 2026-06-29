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

Verificar el backend:

```sh
make backend-test
```

El comando ejecuta las pruebas Go del backend con un cache local del repositorio. Tambien se puede ejecutar manualmente:

```sh
cd backend
go test ./...
```

En entornos donde el cache global de Go no sea escribible, se puede usar un cache local:

```sh
cd backend
GOCACHE=../.gocache go test ./...
```

Levantar una base PostgreSQL 16 limpia para validar el backend:

```sh
make db-reset
make migrate-up
```

La base queda publicada en `localhost:54339` con la URL:

```text
postgres://postgres:postgres@localhost:54339/todolist_validation?sslmode=disable
```

Ejecutar la API backend contra una base PostgreSQL con las migraciones aplicadas:

```sh
make api-up
make api-status
```

Detener la API, detener la base de validacion y remover servicios huerfanos:

```sh
make validation-down
```

Para levantar la base sin borrar datos existentes:

```sh
make db-up
```

Para ejecutar la API en primer plano durante desarrollo:

```sh
make api-dev
```

Variables relevantes:

- `API_ADDR`: direccion de escucha, por defecto `:8080`.
- `DATABASE_URL`: conexion PostgreSQL.
- `JWT_SECRET`: secreto para firmar JWT. Es obligatorio salvo cuando `APP_ENV=development`.
- `APP_ENV`: usar `development` solo para ejecucion local; habilita un secreto JWT local por defecto.
- `JWT_TTL_MINUTES`: duracion del token, por defecto `60`.

Levantar el runtime completo con Docker Compose:

```sh
make runtime-up
```

Este comando usa el proyecto Compose `todolist-runtime`, construye las imagenes locales `todolist-api:local` y `todolist-web:local`, aplica las migraciones sobre la base runtime si todavia no existen, y levanta:

- API: `http://localhost:8080`
- Web: `http://localhost:5173`
- Grafana: `http://localhost:3000` (`admin` / `admin`)
- Loki: `http://localhost:3100`
- PostgreSQL runtime: `localhost:54340`

Inspeccionar el estado del runtime:

```sh
make runtime-status
```

Detener el runtime sin borrar los volumenes persistentes:

```sh
make runtime-down
```

El volumen de datos principal del runtime es `todolist-runtime_todolist_runtime_db`. La base de validacion usa otro proyecto, puerto y volumen: `todolist-validation`, `localhost:54339` y `todolist-validation_todolist_validation_db`. Por eso `make db-reset` reinicia solo la base de validacion y no borra datos del runtime.

Para crear un usuario de prueba en el runtime antes de iniciar sesion desde la web:

```sh
curl -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.test","password":"TestPassword123!"}' \
  http://localhost:8080/api/register
```

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
