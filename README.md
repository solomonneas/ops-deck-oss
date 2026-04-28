# ops-deck-oss

Self-hosted operational dashboard for OpenClaw users. A better ops page than the default `openclaw dashboard`.

## What you get

Eight pages out of the box:

- **Repos** - your GitHub repos with category/featured annotations
- **RepoDetail** - per-repo deep dives (architecture, tech, code snippets)
- **Codebase** - semantic codebase summaries
- **Search** - semantic code search (requires `ops-deck-lite` skill)
- **Prompts** - prompt library (requires `ops-deck-lite` skill)
- **Journal** - daily session journal from `~/.openclaw/workspace/memory/YYYY-MM-DD.md`
- **Memory** - browse `~/.openclaw/workspace/memory/cards/`
- **Config** - dashboard settings and resolved env vars

## Quick start

```bash
git clone https://github.com/solomonneas/ops-deck-oss.git
cd ops-deck-oss
cp .env.example .env
docker compose up -d
```

Open http://localhost:5173.

The `agent-intel` sidecar mounts `$OPENCLAW_WORKSPACE` read-only (defaults to the bundled `./sample-workspace` so the demo works on first run). Set `OPENCLAW_WORKSPACE=$HOME/.openclaw/workspace` in `.env` to point at your own.

## Architecture

```
ui (port 5173)   ─── DataSource interface
                      ├── sidecar adapter (default)  ── agent-intel (port 8005)
                      └── openclaw-only adapter      ── empty stub (v1)
```

The UI auto-selects the sidecar adapter when `agent-intel` is reachable on `/healthz`. Search and Prompts are optional; they hit the `ops-deck-lite` clawhub skill (separate install) when running.

## Bring your own data

Three optional overlay files extend what the sidecar serves:

| File | Path | Purpose |
|---|---|---|
| `repos.json` | `$OPENCLAW_WORKSPACE/repos.json` | Adds `category`/`featured` to your `gh repo list` output. |
| `repos-detail.json` | `$OPENCLAW_WORKSPACE/repos-detail.json` | Per-repo deep-dive content. Shape: `{ slug: { name, summary, tech, diagrams, ... } }`. |
| `codebase.json` | `$OPENCLAW_WORKSPACE/codebase.json` | Semantic codebase entries: `[ { path, summary, language } ]`. |

Without these, the corresponding pages render with empty/skeleton state.

## Companion: ops-deck-lite

For semantic code search and the prompt library, install the `ops-deck-lite` clawhub skill alongside this repo. The UI auto-detects them on ports 5204 and 5202.

## Configuration

Build-time env vars (UI), all `VITE_*`-prefixed, are baked into the bundle at `npm run build`:

| Var | Default | Purpose |
|---|---|---|
| `VITE_SIDECAR_BASE_URL` | `http://localhost:8005` | agent-intel sidecar |
| `VITE_SEARCH_BASE_URL` | `http://localhost:5204` | optional code-search service |
| `VITE_PROMPTS_BASE_URL` | `http://localhost:5202` | optional prompt-library service |
| `VITE_OPSDECK_API_KEY` | (unset) | shared secret with the sidecar |
| `VITE_OPSDECK_HOST_IP` | (page hostname) | host for in-app links to running services |

Runtime env vars (sidecar):

| Var | Default | Purpose |
|---|---|---|
| `MEMORY_DIR` | `./workspace/memory` | journal markdown files |
| `CARDS_DIR` | `./workspace/memory/cards` | memory cards |
| `REPOS_OVERLAY` | `./workspace/repos.json` | repo annotations |
| `REPO_DETAIL_OVERLAY` | `./workspace/repos-detail.json` | per-repo deep dives |
| `CODEBASE_OVERLAY` | `./workspace/codebase.json` | codebase entries |
| `OPSDECK_API_KEY` | (unset) | required `X-API-Key` if set |
| `GH_ENABLED` | `true` | calls `gh repo list` for live repo data |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:8005` | CORS allowlist (comma-separated) |
| `BIND_HOST` | `127.0.0.1` | only used if running `python server.py` directly (not uvicorn) |

## Contributing

PRs welcome. The repo is gated by [Content Guard](https://github.com/solomonneas/content-guard) at three layers: pre-commit hook, CI scan, and PR-create wrapper. Run `bash scripts/install-hooks.sh` after cloning.

For PRs, use `bash scripts/pr-create.sh "title" body.md` so the body gets sanitized before publishing.

The pre-commit hook uses `grep -P` (PCRE), which is GNU grep on Linux. macOS users with BSD grep should install GNU grep (`brew install grep` and use `ggrep` or alias).

## License

MIT. See `LICENSE`.
