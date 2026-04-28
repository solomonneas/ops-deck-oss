# agent-intel

Read-only FastAPI sidecar for the opsdeck dashboard. Serves the journal, memory cards, repos, and codebase data from the OpenClaw workspace filesystem.

## Run

    uvicorn server:app --host 127.0.0.1 --port 8005

## Test

    pytest -v

See the parent repo README for the full architecture.
