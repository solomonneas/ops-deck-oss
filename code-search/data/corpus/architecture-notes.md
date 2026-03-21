# Architecture Notes

Ops Deck OSS is a self-hosted operations dashboard for AI agent workflows. The public stack separates telemetry, prompt storage, and search into independent services so local-first deployments stay understandable.

- The UI renders dashboard panels and routes using typed API clients.
- The API serves generic operational data such as cron jobs, security posture, architecture metadata, and backlog tasks.
- The prompt library stores reusable prompts with lightweight CRUD semantics.
- The code search service indexes markdown, text, and JSON corpus files into SQLite and can call Ollama for embeddings.

Use the search route to inspect sample runbooks, architecture notes, and prompt references.

