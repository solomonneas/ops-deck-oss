# Repository Guidance

Public repo. Self-hosted operational dashboard for OpenClaw users, run via
`docker compose up -d` (UI on 5173, sidecar on 8005). Default branch: `master`.

## Definition of Done

A change is done only when every command below passes. Run the set matching
what you touched; run both sets if in doubt.

- UI (inside `ui/`): `npm run test`, `npx tsc -b --noEmit`, `npm run lint`, `npm run build`
- Sidecar (inside `agent-intel/`): `pip install -r requirements.txt`, then `python -m pytest -v`

CI mirrors these on push/PR to `master`: Node 20 runs typecheck, test, build;
Python 3.11 runs pytest. `npm run lint` is local-only but still required here.
Report actual results. If anything fails, report the failure verbatim and do
not claim success.

## Hard Prohibitions

- Hook or CI scan blocks a commit or push: never use `--no-verify`. The
  four-layer Content Guard enforcement (pre-commit hook, commit-msg hook, CI
  scan, PR wrapper) is the publishing boundary for this public repo. Fix the
  content until it passes.
- Layer-2 blocklist grep fires: `.githooks/project-blocks.txt` is the single
  source of truth for forbidden tokens (personal hostnames, home LAN IP range,
  similar identifiers). Fix or reword the flagged content. Never edit
  `project-blocks.txt` to let content through; changes to it require explicit
  user approval. Never write those tokens into tracked files, including this one.
- Sidecar change adds POST/PUT/DELETE or any state mutation: the sidecar
  mounts the workspace read-only and serves it; it is read-only by design.
  Do not add state-changing endpoints to `agent-intel/server.py` without
  explicit user approval.
- A test fails: never weaken, skip, or delete it to make the suite green.
  Fix the code, or report the failing test and its output verbatim.
- Anything blocks progress: report the exact blocker and stop. Do not work
  around it.

## Working Rules

- Fresh clone: run `bash scripts/install-hooks.sh` once to wire `.githooks/`
  into `core.hooksPath` before any commit.
- Adding a page: page file in `ui/src/pages/` (eight exist today), `DataSource`
  method in `ui/src/data-sources/types.ts`, implement in BOTH `sidecar.ts` and
  `openclaw-only.ts`, sidecar route in `agent-intel/server.py` with a pytest
  test, then wire into `App.tsx` and `Sidebar.tsx`. Skipping an adapter breaks
  the other data-source mode.
- Touching one adapter: update both. Every `DataSource` method declared in
  `types.ts` must exist in both adapters.
- Opening a PR: use `bash scripts/pr-create.sh "title" body.md` so the body is
  sanitized before publishing. Do not call `gh pr create` directly.
- Tempted to `git add` top-level `api/`, `code-search/`, `prompt-library/`,
  `memory/`, or `.worktrees/`: do not. They are local-only and untracked.
- Need a single sidecar test file: `python -m pytest tests/test_journal.py -v`.

## Gotchas

- Pre-commit hook needs `jq`, `python3`, GNU grep with `-P`, and a local
  content-guard checkout (default `$HOME/repos/content-guard/src`, override
  with `CG_SRC`). The pre-push hook in `hooks/pre-push` uses
  `CONTENT_GUARD_DIR` instead.
- `.content-guard.yml` is exempt from the CI project-block scan because it
  legitimately contains the regex literals it defines.
- `VITE_*` env vars are baked into the UI bundle at build time; changing one
  requires a rebuild. Runtime sidecar config uses plain env vars (README tables).
- `docker-compose.yml` sets `GH_ENABLED=false` because the slim image lacks
  the `gh` CLI. Live repo listing needs `gh` available to the sidecar.
- Unset `OPSDECK_API_KEY` means the sidecar serves unauthenticated (with a
  warning). When set, requests need `X-API-Key` and the UI needs the matching
  `VITE_OPSDECK_API_KEY`.
- `sample-workspace/` is the bundled demo data the compose stack mounts when
  `OPENCLAW_WORKSPACE` is unset.

## Memory Handoff

At the end of any substantial task, write a handoff note to
`.claude/memory-handoffs/` using that directory's `TEMPLATE.md`. Record durable
discoveries, gotchas, and decisions. Do not wait to be reminded.
