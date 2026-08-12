# PulseBoard

PulseBoard is a small project & task tracking dashboard used as a **demo application
for VeloCore**, a self-hosted Kubernetes-native deployment platform. It exists to
showcase VeloCore deploying a realistic two-tier web app (separate frontend and
backend projects) from a single GitHub repository, and is not intended to be a
production product on its own.

## Architecture

This repository contains two independently deployable projects:

```
pulseboard-demo/
├── frontend/   React + Vite SPA, served in production by nginx (port 80)
└── backend/    Node.js 22 + Express API backed by PostgreSQL (port 8080)
```

- **frontend** — builds with `npm run build` and is served as static files by
  nginx, which also proxies `/api/` requests to the backend service.
- **backend** — a stateless Express API that connects to PostgreSQL via
  `DATABASE_URL`, auto-creates its schema on startup, and seeds a few sample
  records the first time it runs against an empty database.

Each project has its own `package.json` and `Dockerfile` so VeloCore's scanner
can detect and deploy them as separate services from the same repo.

## API Endpoints

| Method | Path              | Description                                  |
|--------|-------------------|-----------------------------------------------|
| GET    | `/api/health`     | Health check — `{ "status": "healthy", "database": "connected" }` |
| GET    | `/api/projects`   | List all projects                             |
| GET    | `/api/tasks`      | List all tasks (with project name)            |
| GET    | `/api/stats`      | Dashboard stats (totals, completed, in progress) |
| POST   | `/api/tasks`      | Create a task — `{ "title", "project_id"? }`  |
| PATCH  | `/api/tasks/:id`  | Update a task's status — `{ "status" }`       |

Valid task statuses: `todo`, `in-progress`, `done`.

## Configuration

The backend requires a single environment variable:

- `DATABASE_URL` — PostgreSQL connection string. The backend will exit
  immediately with a clear error if this is not set.

The frontend's nginx layer proxies `/api/` to a backend service reachable at
`backend:8080` by default (see `frontend/nginx.conf`), matching the standard
service name VeloCore assigns to the backend project.

## Running locally

```bash
# Backend
cd backend
npm install
DATABASE_URL=postgres://user:password@localhost:5432/pulseboard npm start

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

## Deploying with VeloCore

Point VeloCore at this repository. It will detect `frontend/` (vite-react,
port 80) and `backend/` (express, port 8080) as two separate projects, build
each using its own `Dockerfile`, and deploy them as independent services.
Set `DATABASE_URL` on the backend service before deploying.
