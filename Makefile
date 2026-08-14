API_PORT ?= 8000
FRONTEND_PORT ?= 3000

.PHONY: dev dev-backend dev-frontend

dev:
	$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	cd backend && PORT=$(API_PORT) go run ./main.go

dev-frontend:
	cd frontend && PORT=$(FRONTEND_PORT) REACT_APP_API_URL=http://localhost:$(API_PORT)/api pnpm start
