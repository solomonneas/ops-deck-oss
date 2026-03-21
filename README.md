# Ops Deck OSS

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/UI-React%20%2B%20Vite-61DAFB)
![Express](https://img.shields.io/badge/API-Express-111827)
![FastAPI](https://img.shields.io/badge/Search-FastAPI-009688)
![Docker Compose](https://img.shields.io/badge/Infra-Docker%20Compose-2496ED)

Ops Deck OSS is a self-hosted operations dashboard for AI agent infrastructure. It includes a polished dark UI, seeded generic data, an Express telemetry API, a FastAPI code-search service with SQLite + Ollama embeddings (with graceful fallback), and a persistent prompt library.

## Features

- **8-panel dashboard** built with React + Vite + Tailwind:
  - Dashboard, Cron Calendar, Intel Feed, Security, Infrastructure, Code Search, Prompts, Backlog
- **Ops Deck API (Express)** with JSON-backed endpoints:
  - `/api/cron-jobs`, `/api/agent-intel`, `/api/agents/intel`, `/api/security-audit`, `/api/architecture`, `/api/backlog`, `/api/health`
- **Code Search (FastAPI)**:
  - `/api/search`, `/api/index`, `/api/health`
  - SQLite index + optional Ollama embeddings via `qwen3-embedding:8b`
- **Prompt Library (Express CRUD)**:
  - `/api/prompts`, `/api/prompts/:id`
- **Docker Compose stack** for `ui`, `api`, `code-search`, `prompt-library`, and `ollama`
- **Public-safe example data** only (no personal/private data, credentials, or real infrastructure identifiers)

## Repository Layout

```text
ops-deck-oss/
├── api/
├── code-search/
├── docs/
│   ├── pm2-setup.md
│   └── screenshots/
├── prompt-library/
├── ui/
├── .env.example
├── docker-compose.yml
├── LICENSE
└── README.md
```

## Quick Start

```bash
git clone https://github.com/your-username/ops-deck-oss.git
cd ops-deck-oss
cp .env.example .env
docker compose up -d

# First time only
docker compose exec ollama ollama pull qwen3-embedding:8b
```

Open:

- UI: <http://localhost:5173>
- API: <http://localhost:8005>
- Prompt Library: <http://localhost:5202>
- Code Search: <http://localhost:5204>
- Ollama: <http://localhost:11434>

## Local Development

```bash
# Terminal 1
cd api && npm install && npm run dev

# Terminal 2
cd prompt-library && npm install && npm run dev

# Terminal 3
cd code-search
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5204

# Terminal 4
cd ui && npm install && npm run dev
```

Vite UI environment variables:

- `VITE_API_BASE_URL`
- `VITE_PROMPT_LIBRARY_BASE_URL`
- `VITE_CODE_SEARCH_BASE_URL`

## Screenshots

![Dashboard preview](./docs/screenshots/dashboard-preview.svg)
![Prompts and search preview](./docs/screenshots/prompts-search-preview.svg)

## Example Data Included

- Cron schedules with mixed healthy/warning/degraded states
- Security controls and findings
- Intel feed across multiple categories
- Architecture map and service flows
- Backlog tasks across status lanes
- Seed prompt templates
- Search corpus documents for out-of-the-box query results

## Notes

- Code search automatically falls back to deterministic local embeddings if Ollama/model is unavailable.
- Prompt persistence uses a Docker volume (`prompt-library-data`).
- Non-Docker process management guidance is in [`docs/pm2-setup.md`](./docs/pm2-setup.md).
