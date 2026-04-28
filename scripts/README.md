# scripts/

| Script | What it does |
|---|---|
| `install-hooks.sh` | Wires `.githooks/` into git config so pre-commit + commit-msg hooks run. |
| `pr-create.sh` | Sanitizes a PR body through Content Guard, then calls `gh pr create`. |

## install-hooks.sh

```bash
bash scripts/install-hooks.sh
```

Sets `core.hooksPath=.githooks` for this repo so the pre-commit and commit-msg
Content Guard checks run automatically.

## pr-create.sh

```bash
bash scripts/pr-create.sh "PR title" path/to/body.md
```

Two-layer scan of the PR body file before publishing:

1. Content Guard's default rule scan (the same scan the local pre-commit hook
   runs, applied to a throwaway git repo containing the body).
2. The project-specific PCRE pattern file at `.githooks/project-blocks.txt`
   (hostnames, home LAN IPs, school affiliation, personal handles).

Refuses to publish if either layer reports a block-severity match. Otherwise
calls `gh pr create --title <title> --body-file <body-file>`.

Override the Content Guard source location with
`CG_SRC=/path/to/content-guard/src` if you've cloned it somewhere other than
the default `~/repos/content-guard/src`.
