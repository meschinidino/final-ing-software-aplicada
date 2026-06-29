VALIDATION_COMPOSE := docker compose -p todolist-validation -f deploy/docker-compose.yml --profile validation
RUNTIME_COMPOSE := docker compose -p todolist-runtime -f deploy/docker-compose.yml
DATABASE_URL ?= postgres://postgres:postgres@localhost:54339/todolist_validation?sslmode=disable
JWT_SECRET ?= local-validation-secret
APP_ENV ?= development
API_PORT ?= 8080
API_ADDR ?= :$(API_PORT)
GOCACHE ?= $(CURDIR)/.gocache
API_PID_FILE := .api-dev.pid
API_LOG_FILE := .api-dev.log
API_BIN := .api-dev-bin

.PHONY: backend-test db-up db-down db-reset migrate-up api-dev api-up api-down api-status validation-down runtime-up runtime-down runtime-status runtime-build

backend-test:
	cd backend && GOCACHE=$(GOCACHE) go test ./...

db-up:
	$(VALIDATION_COMPOSE) up -d --wait validation-db

db-down:
	$(VALIDATION_COMPOSE) down --remove-orphans

db-reset:
	$(VALIDATION_COMPOSE) down --volumes --remove-orphans
	$(VALIDATION_COMPOSE) up -d --wait validation-db

migrate-up:
	$(VALIDATION_COMPOSE) exec -T validation-db sh -c 'for migration in /migrations/*.up.sql; do psql -v ON_ERROR_STOP=1 -U postgres -d todolist_validation -f "$$migration"; done'

runtime-build:
	$(RUNTIME_COMPOSE) build api web

runtime-up:
	$(RUNTIME_COMPOSE) up -d --build --wait

runtime-status:
	$(RUNTIME_COMPOSE) ps

runtime-down:
	$(RUNTIME_COMPOSE) down --remove-orphans

api-dev:
	cd backend && DATABASE_URL='$(DATABASE_URL)' JWT_SECRET='$(JWT_SECRET)' APP_ENV='$(APP_ENV)' API_ADDR='$(API_ADDR)' go run ./cmd/api

api-up:
	@if [ -f "$(API_PID_FILE)" ] && kill -0 "$$(cat "$(API_PID_FILE)")" 2>/dev/null; then \
		echo "api already running with pid $$(cat "$(API_PID_FILE)")"; \
	else \
		rm -f "$(API_PID_FILE)" "$(API_LOG_FILE)" "$(API_BIN)"; \
		(cd backend && GOCACHE='$(GOCACHE)' go build -o "../$(API_BIN)" ./cmd/api); \
		nohup env DATABASE_URL='$(DATABASE_URL)' JWT_SECRET='$(JWT_SECRET)' APP_ENV='$(APP_ENV)' API_ADDR='$(API_ADDR)' ./$(API_BIN) > "$(API_LOG_FILE)" 2>&1 & echo $$! > "$(API_PID_FILE)"; \
		echo "api started with pid $$(cat "$(API_PID_FILE)"); logs: $(API_LOG_FILE)"; \
	fi

api-down:
	@if [ -f "$(API_PID_FILE)" ]; then \
		pid="$$(cat "$(API_PID_FILE)")"; \
		if kill -0 "$$pid" 2>/dev/null; then \
			kill "$$pid"; \
			while kill -0 "$$pid" 2>/dev/null; do sleep 0.1; done; \
			echo "api stopped pid $$pid"; \
		else \
			echo "api pid $$pid is not running"; \
		fi; \
		rm -f "$(API_PID_FILE)" "$(API_BIN)"; \
	else \
		echo "api is not running"; \
	fi; \
	port_pid="$$(lsof -tiTCP:$(API_PORT) -sTCP:LISTEN 2>/dev/null | head -n 1)"; \
	if [ -n "$$port_pid" ]; then \
		echo "port $(API_PORT) is still used by unmanaged pid $$port_pid; leaving it running"; \
	fi

api-status:
	@if [ -f "$(API_PID_FILE)" ] && kill -0 "$$(cat "$(API_PID_FILE)")" 2>/dev/null; then \
		echo "api running with pid $$(cat "$(API_PID_FILE)")"; \
	elif lsof -tiTCP:$(API_PORT) -sTCP:LISTEN >/dev/null 2>&1; then \
		echo "api port $(API_PORT) is listening without a managed pid file"; \
	else \
		echo "api is not running"; \
	fi

validation-down: api-down db-down
