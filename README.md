# PulseBoard

A simple project & task tracking dashboard. Two-tier app: React (Vite) frontend + Express backend, no database required — data lives in memory on the backend.

## Structure
```
pulseboard-demo/
├── frontend/   React + Vite SPA, served by nginx (port 80)
└── backend/    Node.js 22 + Express API (port 8080)
```

## API
| Method | Path             | Description               |
|--------|------------------|----------------------------|
| GET    | /api/health      | Health check               |
| GET    | /api/projects    | List projects              |
| POST   | /api/projects    | Create a project           |
| GET    | /api/tasks       | List tasks                 |
| POST   | /api/tasks       | Create a task               |
| PATCH  | /api/tasks/:id   | Update task status          |
| GET    | /api/stats       | Dashboard stats             |

## Run locally
```bash
cd backend && npm install && npm start
cd frontend && npm install && npm run dev
```

## Docker
Frontend nginx proxies `/api/` to `BACKEND_HOST:BACKEND_PORT` (defaults `backend:8080`).
