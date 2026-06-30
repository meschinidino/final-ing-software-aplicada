# Evidencia de evaluacion

Este archivo resume la evidencia local y los checks manuales/remotos que debe revisar la persona evaluadora. No se incluyen screenshots ni reportes generados para evitar archivos binarios o artefactos locales en el repositorio.

## Checks locales

| Check | Comando | Resultado |
| --- | --- | --- |
| Backend unit tests | `make backend-test` | Validado localmente. `go test ./...` paso para `internal/auth` e `internal/handlers`; el resto de paquetes no tiene tests. |
| Playwright E2E | `cd web && npx playwright test` | Validado localmente. Pasaron 3/3 pruebas: login UI, storage state por API y CRUD UI. |
| Build mobile/PWA | `cd mobile && npm run build` | Validado localmente. Vite genero `dist/manifest.webmanifest`, `dist/sw.js` y precache de PWA. Quedo solo una advertencia de chunk grande. |
| Runtime Docker | `make runtime-up && make runtime-status` | Validado localmente. Compose levanto `api`, `web`, `db`, `loki`, `alloy` y `grafana` en estado healthy/up. |
| API health | `curl http://127.0.0.1:8080/health` | Validado localmente. Respuesta: `{"status":"ok"}`. |
| Loki API logs | `curl` contra `/loki/api/v1/query_range` con `{compose_project="todolist-runtime", compose_service="api"}` | Validado localmente. Loki devolvio streams del contenedor `todolist-runtime-api-1` con requests `GET /health`. |

## Web login y CRUD

Verificacion manual esperada:

1. Levantar el runtime con `make runtime-up`.
2. Crear un usuario de prueba con `POST /api/register` o desde la UI.
3. Abrir `http://localhost:5173`.
4. Iniciar sesion.
5. Crear una lista y una tarea.
6. Confirmar que aparecen en pantalla.
7. Borrar la tarea y la lista.
8. Confirmar que ya no aparecen.

El flujo tambien esta cubierto por `web/e2e/todolist.spec.ts`, que prueba login por UI, estado autenticado generado por API y CRUD desde la UI.

## Playwright

La suite esperada esta en `web/e2e/todolist.spec.ts` y contiene tres pruebas:

- login desde la UI y persistencia del JWT;
- autenticacion por API usando `APIRequestContext` y `storageState`;
- creacion y borrado de lista/tarea desde la UI.

Comando:

```sh
cd web
npx playwright test
```

## Grafana y LogQL

Verificacion manual esperada:

1. Levantar el runtime con `make runtime-up`.
2. Generar trafico con `curl http://localhost:8080/health`.
3. Abrir Grafana en `http://localhost:3000` con `admin` / `admin`.
4. Entrar a Explore y seleccionar datasource `Loki`.
5. Ejecutar:

```logql
{compose_project="todolist-runtime", compose_service="api"}
```

Resultado esperado: aparecen logs recientes del contenedor API, incluyendo la request de health o trafico de autenticacion/CRUD.

Resultado local registrado: Loki devolvio logs del contenedor `todolist-runtime-api-1` para la query esperada, con varias lineas `GET /health` y status HTTP 200.

## PWA offline

Verificacion manual esperada:

1. Levantar API y base con `make db-reset`, `make migrate-up` y `make api-up`, o usar el runtime completo.
2. Construir y previsualizar la app mobile:

```sh
cd mobile
npm run build
VITE_API_URL=http://localhost:8080 npm run preview
```

3. Abrir `http://localhost:4174`.
4. Registrar o iniciar sesion.
5. Cargar datos de listas/tareas mientras la API esta disponible.
6. Desactivar red desde DevTools o detener la API.
7. Recargar la pagina.

Resultado esperado: el shell de la app carga, el manifest esta disponible en `/manifest.webmanifest`, hay service worker registrado y se muestra el ultimo snapshot local con el indicador `Offline cache`.

## CI y GHCR

Verificacion remota confirmada despues del push a `main`:

- Abrir la pestaña Actions del repositorio.
- Confirmar que el workflow `CI` corre en `push` a `main` y `pull_request` contra `main`.
- Confirmar que el job `Backend tests` pasa antes de publicar imagen.
- Confirmar que los pull requests no publican imagen porque `api-image` solo corre en push a `main`.
- Confirmar el paquete en GitHub Container Registry:

```text
ghcr.io/meschinidino/todolist-api
```

Imagen verificada para esta entrega:

```text
ghcr.io/meschinidino/todolist-api:97cb3bddc3fd829832c1c1caf30db52e6be8322c
```

Tags esperados por cada corrida exitosa:

- `latest`
- `<commit-sha>` de la corrida exitosa, verificado para `97cb3bddc3fd829832c1c1caf30db52e6be8322c`.

## Notas de evidencia

- No se deben commitear screenshots, videos, reportes de Playwright, builds `dist/`, `node_modules`, logs locales ni secretos.
- La evidencia remota de GitHub Actions y GHCR quedo validada para el commit `97cb3bddc3fd829832c1c1caf30db52e6be8322c`.
