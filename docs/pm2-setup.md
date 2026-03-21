# PM2 Setup

This repo is designed primarily for Docker Compose, but each service can also run under PM2 on a single host.

## Prerequisites

- Node.js 22+
- Python 3.12+
- `pm2` installed globally
- Ollama installed locally if you want semantic embeddings for code search

## Install dependencies

```bash
cd api && npm install
cd ../prompt-library && npm install
cd ../ui && npm install
cd ../code-search && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
```

## Start services

```bash
pm2 start npm --name ops-deck-api --cwd ./api -- run dev
pm2 start npm --name ops-deck-prompts --cwd ./prompt-library -- run dev
pm2 start npm --name ops-deck-ui --cwd ./ui -- run dev -- --host 0.0.0.0
pm2 start ". .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 5204" --name ops-deck-search --cwd ./code-search
```

If Ollama is installed on the same host:

```bash
ollama serve
ollama pull qwen3-embedding:8b
```

## Persist PM2

```bash
pm2 save
pm2 startup
```

