# ops-deck-oss

Public template version of Solomon's private opsdeck. Owned by `solomonneas`.

## Origin

Copied + scrubbed from `~/repos/opsdeck` (private). Sidecar forked from the `dev-journal-api` upstream. Design notes in `.claude/memory-handoffs/2026-04-28-1145-opsdeck-public-template-design.md` (gitignored locally).

## Hard rules for any agent editing this repo

- Public repo. Content Guard runs pre-commit + CI + PR. Never `--no-verify`.
- No mention of personal hostnames, the home LAN IP range, school affiliation, or other identifiers. The layer-2 block patterns live in `.githooks/project-blocks.local.txt` (untracked, gitignored - the tokens themselves must stay out of the public repo) plus the `PROJECT_BLOCKS_EXTRA` Actions secret for CI. The tracked `.githooks/project-blocks.txt` holds only generic patterns and documents the convention.
- `~/.openclaw/workspace/...` mentions in docs are OK (warn-level, not block).
- No Co-Authored-By trailers. No AI/assistant attribution in commit messages (the commit-msg hook blocks it).

## Architecture

- `ui/`: React 19 + Vite + Tailwind v4 + react-router-dom
- `agent-intel/`: FastAPI sidecar (Python 3.11), 8 routes, ~450 LOC
- Adapter layer in `ui/src/data-sources/` decouples pages from data source

## Adding a new page

1. Add the page file under `ui/src/pages/`.
2. Add a `DataSource` method in `ui/src/data-sources/types.ts` if the page needs new data.
3. Implement that method in `ui/src/data-sources/sidecar.ts` AND `ui/src/data-sources/openclaw-only.ts`.
4. Add a sidecar route in `agent-intel/server.py` with a pytest test.
5. Add the route to `App.tsx` and a nav item to `Sidebar.tsx`.

## Project-specific blocks

The pre-commit hook (`.githooks/pre-commit`), commit-msg hook (`.githooks/commit-msg`), and PR wrapper (`scripts/pr-create.sh`) read patterns from `.githooks/project-blocks.txt` (tracked, generic patterns only) plus `.githooks/project-blocks.local.txt` (untracked, identifying tokens). The CI workflow (`.github/workflows/content-guard.yml`) reads the tracked file plus the `PROJECT_BLOCKS_EXTRA` repo Actions secret. When adding an identifying token, update BOTH the local file and the secret (`gh secret set PROJECT_BLOCKS_EXTRA`); never put it in a tracked file.
