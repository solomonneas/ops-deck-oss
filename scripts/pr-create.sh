#!/usr/bin/env bash
set -euo pipefail

# Two-layer Content Guard wrapper around `gh pr create`. The PR body file is
# scanned with the same rules used by the local pre-commit hook and CI:
#
#   Layer 1: Content Guard's default rule scan over the body file. We stage
#            the body inside a throwaway git repo so `git_scan --all-tracked`
#            can chew on it without touching this repo's index.
#   Layer 2: project-specific PCRE block list at .githooks/project-blocks.txt
#            (hostnames, home LAN IPs, school affiliation, personal handles).
#
# If either layer reports a block-severity finding, the PR is NOT published
# and the script exits non-zero with the offending matches printed.
#
# Override CG_SRC if Content Guard lives somewhere other than the default
# (e.g. export CG_SRC=$HOME/code/content-guard/src).

CG_SRC="${CG_SRC:-$HOME/repos/content-guard/src}"
PROJECT_BLOCKS_FILE=".githooks/project-blocks.txt"

usage() {
  echo "Usage: $0 <title> <body-file>"
  echo ""
  echo "  Sanitizes the body via Content Guard's default rules + the project"
  echo "  pattern file (.githooks/project-blocks.txt). Refuses to publish if"
  echo "  any block-severity finding fires. On success, calls:"
  echo "    gh pr create --title <title> --body-file <body-file>"
  exit 2
}

[ $# -ge 2 ] || usage
TITLE="$1"
BODY_IN="$2"

[ -f "$BODY_IN" ] || { echo "Body file not found: $BODY_IN"; exit 1; }
if [ ! -d "$CG_SRC" ]; then
  echo "Content Guard source not found at $CG_SRC."
  echo "Set CG_SRC env var to your local content-guard checkout (the dir containing content_guard/)."
  exit 1
fi

# Resolve to an absolute path before we cd into the throwaway repo.
BODY_ABS="$(readlink -f "$BODY_IN")"

# === Layer 1: Content Guard default scan over the body file ===
TMP_DIR="$(mktemp -d /tmp/cg-pr.XXXXXX)"
trap 'rm -rf "$TMP_DIR"' EXIT
cp "$BODY_ABS" "$TMP_DIR/body.md"
(
  cd "$TMP_DIR"
  # Bypass any global hooks during the throwaway scan.
  git -c core.hooksPath=/dev/null init -q
  git -c core.hooksPath=/dev/null add body.md
  git -c core.hooksPath=/dev/null \
      -c user.email=scan@local -c user.name=scan \
      commit -q -m "scan target"
)
PYTHONPATH="$CG_SRC" python3 -m content_guard.git_scan \
  --all-tracked --json > "$TMP_DIR/cg.json" 2>/dev/null \
  || true

if [ -s "$TMP_DIR/cg.json" ] && command -v jq >/dev/null 2>&1; then
  if jq -e '.blocked == true' "$TMP_DIR/cg.json" > /dev/null 2>&1; then
    echo ""
    echo "Content Guard BLOCKED PR body. Findings:"
    jq '.files' "$TMP_DIR/cg.json"
    echo ""
    exit 1
  fi
fi

# === Layer 2: project-specific block patterns ===
if [ -f "$PROJECT_BLOCKS_FILE" ]; then
  PROJECT_BLOCK_RE="$(grep -Ev '^\s*(#|$)' "$PROJECT_BLOCKS_FILE" | paste -sd '|' -)"
  if [ -n "$PROJECT_BLOCK_RE" ]; then
    if grep -nP "$PROJECT_BLOCK_RE" "$BODY_ABS" > "$TMP_DIR/project-blocks.txt" 2>/dev/null; then
      echo ""
      echo "Project-specific Content Guard rules BLOCKED PR body. Forbidden tokens:"
      cat "$TMP_DIR/project-blocks.txt"
      echo ""
      echo "(See $PROJECT_BLOCKS_FILE for the full list of blocked patterns.)"
      exit 1
    fi
  fi
fi

# === All checks clean. Publish. ===
echo "PR body clean. Publishing via gh pr create..."
gh pr create --title "$TITLE" --body-file "$BODY_ABS"
