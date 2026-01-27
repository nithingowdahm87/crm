.PHONY: help build up down restart logs clean rebuild

# Default target
.DEFAULT_GOAL := help

# Variables
DOCKER_COMPOSE := DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker compose
SERVICES := mysql backend frontend

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all services
	$(DOCKER_COMPOSE) build --parallel

up: ## Start all services
	$(DOCKER_COMPOSE) up -d

down: ## Stop all services
	$(DOCKER_COMPOSE) down

restart: ## Restart all services
	$(DOCKER_COMPOSE) restart

logs: ## View logs
	$(DOCKER_COMPOSE) logs -f

clean: ## Clean up volumes and images
	$(DOCKER_COMPOSE) down -v --rmi local
	docker system prune -f

rebuild: clean build up ## Rebuild everything from scratch

dev: ## Start in development mode with hot reload
	$(DOCKER_COMPOSE) up

prod-build: ## Build for production
	$(DOCKER_COMPOSE) build --no-cache

health: ## Check service health
	@curl -f http://localhost:8000/health && echo "Backend: OK" || echo "Backend: FAIL"
	@curl -f http://localhost:3000/health && echo "Frontend: OK" || echo "Frontend: FAIL"

shell-backend: ## Open shell in backend container
	docker exec -it task-backend-1 /bin/bash

shell-frontend: ## Open shell in frontend container
	docker exec -it task-frontend-1 /bin/sh

db-shell: ## Open MySQL shell
	docker exec -it task-mysql-1 mysql -u crm_user -pcrm_password crm
